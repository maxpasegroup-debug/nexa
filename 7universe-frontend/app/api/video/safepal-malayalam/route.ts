import { existsSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const LOCAL_VIDEO_PATH = path.join(process.cwd(), "public", "video", "safepal-malayalam.mp4");
const LOCAL_VIDEO_URL = "/video/safepal-malayalam.mp4";

function getConfiguredVideoUrl() {
  const configuredUrl = process.env.SAFEPAL_VIDEO_URL?.trim();

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

export async function GET(request: Request) {
  const configuredUrl = getConfiguredVideoUrl();

  if (configuredUrl) {
    return NextResponse.redirect(configuredUrl, 307);
  }

  if (existsSync(LOCAL_VIDEO_PATH)) {
    return NextResponse.redirect(new URL(LOCAL_VIDEO_URL, request.url), 307);
  }

  return NextResponse.json(
    {
      error: "SafePal video is not configured.",
      message: "Set SAFEPAL_VIDEO_URL to a hosted MP4 URL in production.",
    },
    { status: 404 },
  );
}
