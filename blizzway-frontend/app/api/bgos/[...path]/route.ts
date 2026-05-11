import { NextResponse } from "next/server";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-length",
  "expect",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

type RouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

const ALLOWED_UPSTREAM_PREFIXES = [
  "api/auth/",
  "api/career7/",
  "api/register",
  "api/forgot-password",
  "api/reset-password",
];

function getBgosBaseUrl() {
  const configured = process.env.BGOS_API_URL;
  if (configured) return configured.replace(/\/+$/, "");

  const publicUrl = process.env.NEXT_PUBLIC_API_URL;
  if (publicUrl?.startsWith("http://") || publicUrl?.startsWith("https://")) {
    return publicUrl.replace(/\/+$/, "");
  }

  return "http://localhost:3000";
}

function isAllowedUpstreamPath(path: string) {
  const normalized = path.replace(/^\/+/, "");
  return ALLOWED_UPSTREAM_PREFIXES.some((prefix) => (
    normalized === prefix.replace(/\/$/, "") || normalized.startsWith(prefix)
  ));
}

async function buildUpstreamUrl(request: Request, context: RouteContext) {
  const params = await context.params;
  const path = params.path?.join("/") ?? "";
  const sourceUrl = new URL(request.url);
  const upstreamUrl = new URL(`/${path}`, getBgosBaseUrl());
  upstreamUrl.search = sourceUrl.search;

  return upstreamUrl;
}

function buildForwardHeaders(request: Request) {
  const headers = new Headers();

  request.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (!HOP_BY_HOP_HEADERS.has(lowerKey)) {
      headers.set(key, value);
    }
  });

  headers.set("x-blizzway-proxy", "blizzway-frontend");
  if (!headers.has("x-business-model")) {
    headers.set("x-business-model", "blizzway");
  }
  return headers;
}

function getSetCookieHeaders(headers: Headers) {
  const withGetSetCookie = headers as Headers & {
    getSetCookie?: () => string[];
  };

  const cookies = withGetSetCookie.getSetCookie?.();
  if (cookies?.length) return cookies;

  const singleCookie = headers.get("set-cookie");
  return singleCookie ? [singleCookie] : [];
}

async function proxy(request: Request, context: RouteContext) {
  const params = await context.params;
  const path = params.path?.join("/") ?? "";
  if (!isAllowedUpstreamPath(path)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const upstreamUrl = await buildUpstreamUrl(request, { params: Promise.resolve({ path: params.path }) });
  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";

  const upstreamResponse = await fetch(upstreamUrl, {
    method,
    headers: buildForwardHeaders(request),
    body: hasBody ? await request.arrayBuffer() : undefined,
    redirect: "manual",
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  upstreamResponse.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (!HOP_BY_HOP_HEADERS.has(lowerKey) && lowerKey !== "set-cookie") {
      responseHeaders.set(key, value);
    }
  });

  const response = new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });

  for (const cookie of getSetCookieHeaders(upstreamResponse.headers)) {
    response.headers.append("set-cookie", cookie);
  }

  return response;
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
