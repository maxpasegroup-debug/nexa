import { NextResponse } from "next/server";

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitEntry>();

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function tooManyRequests() {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429 },
  );
}

export function rateLimit(request: Request, options: RateLimitOptions) {
  const now = Date.now();
  const clientIp = getClientIp(request);
  const bucketKey = `${options.key}:${clientIp}`;
  const current = buckets.get(bucketKey);

  if (!current || current.resetAt <= now) {
    buckets.set(bucketKey, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return null;
  }

  if (current.count >= options.limit) {
    return tooManyRequests();
  }

  current.count += 1;
  buckets.set(bucketKey, current);

  return null;
}
