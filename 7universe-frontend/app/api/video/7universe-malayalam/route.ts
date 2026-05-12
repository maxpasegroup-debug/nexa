import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const LOCAL_VIDEO_PATH = path.join(process.cwd(), "public", "video", "7universe-malayalam.mov");

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

function streamLocalVideo(request: Request, method: "GET" | "HEAD") {
  const stats = statSync(LOCAL_VIDEO_PATH);
  const range = request.headers.get("range");
  const headers = new Headers();

  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400");
  headers.set("Content-Type", "video/mp4");

  if (!range) {
    headers.set("Content-Length", stats.size.toString());

    const body = method === "HEAD" ? null : (Readable.toWeb(createReadStream(LOCAL_VIDEO_PATH)) as unknown as BodyInit);

    return new Response(body, {
      headers,
      status: 200,
    });
  }

  const [startText, endText] = range.replace(/bytes=/, "").split("-");
  const start = Number.parseInt(startText, 10);
  const end = endText ? Number.parseInt(endText, 10) : stats.size - 1;

  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= stats.size || end >= stats.size || start > end) {
    headers.set("Content-Range", `bytes */${stats.size}`);
    return new Response(null, { headers, status: 416 });
  }

  headers.set("Content-Length", (end - start + 1).toString());
  headers.set("Content-Range", `bytes ${start}-${end}/${stats.size}`);

  const body =
    method === "HEAD" ? null : (Readable.toWeb(createReadStream(LOCAL_VIDEO_PATH, { start, end })) as unknown as BodyInit);

  return new Response(body, {
    headers,
    status: 206,
  });
}

async function handleVideoRequest(request: Request, method: "GET" | "HEAD") {
  const configuredUrl = getConfiguredVideoUrl();

  if (configuredUrl) {
    return streamHostedVideo(request, configuredUrl, method);
  }

  if (existsSync(LOCAL_VIDEO_PATH)) {
    return streamLocalVideo(request, method);
  }

  return NextResponse.json({ error: "7Universe Malayalam video is unavailable." }, { status: 404 });
}

export async function GET(request: Request) {
  return handleVideoRequest(request, "GET");
}

export async function HEAD(request: Request) {
  return handleVideoRequest(request, "HEAD");
}
