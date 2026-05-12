import { existsSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const LOCAL_VIDEO_PATH = path.join(process.cwd(), "public", "video", "7universe-malayalam.mp4");
const LOCAL_VIDEO_URL = "/video/7universe-malayalam.mp4";
const FALLBACK_VIDEO_URL =
  "https://github.com/maxpasegroup-debug/nexa/releases/download/7universe-video-v1/7universe-malayalam.mp4";

function getConfiguredVideoUrl() {
  const configuredUrl = process.env.UNIVERSE_MALAYALAM_VIDEO_URL?.trim();

  if (!configuredUrl) {
    return null;
  }

  try {
    const url = new URL(configuredUrl);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

async function streamHostedVideo(request: Request, videoUrl: URL | string, method: "GET" | "HEAD") {
  const range = request.headers.get("range");
  const upstreamResponse = await fetch(videoUrl, {
    headers: range ? { Range: range } : undefined,
    method,
    redirect: "follow",
  });

  if (!upstreamResponse.ok && upstreamResponse.status !== 206) {
    return NextResponse.json(
      { error: "7Universe Malayalam video is unavailable." },
      { status: upstreamResponse.status || 502 },
    );
  }

  const headers = new Headers();
  headers.set("Accept-Ranges", upstreamResponse.headers.get("Accept-Ranges") ?? "bytes");
  headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400");
  headers.set("Content-Type", "video/mp4");

  const contentLength = upstreamResponse.headers.get("Content-Length");
  const contentRange = upstreamResponse.headers.get("Content-Range");

  if (contentLength) {
    headers.set("Content-Length", contentLength);
  }

  if (contentRange) {
    headers.set("Content-Range", contentRange);
  }

  return new Response(method === "HEAD" ? null : upstreamResponse.body, {
    headers,
    status: upstreamResponse.status,
  });
}

async function handleVideoRequest(request: Request, method: "GET" | "HEAD") {
  const configuredUrl = getConfiguredVideoUrl();

  if (configuredUrl) {
    return streamHostedVideo(request, configuredUrl, method);
  }

  if (process.env.NODE_ENV === "production") {
    return streamHostedVideo(request, FALLBACK_VIDEO_URL, method);
  }

  if (existsSync(LOCAL_VIDEO_PATH)) {
    return NextResponse.redirect(new URL(LOCAL_VIDEO_URL, request.url), 307);
  }

  return streamHostedVideo(request, FALLBACK_VIDEO_URL, method);
}

export async function GET(request: Request) {
  return handleVideoRequest(request, "GET");
}

export async function HEAD(request: Request) {
  return handleVideoRequest(request, "HEAD");
}
