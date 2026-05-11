import type { NextConfig } from "next";

const bgosApiUrl = process.env.BGOS_API_URL || "http://localhost:3000";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://career7.in";

function originOf(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return "";
  }
}

const connectOrigins = [
  "'self'",
  originOf(bgosApiUrl),
  originOf(siteUrl),
  "https://bgos.online",
].filter(Boolean);

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      `connect-src ${connectOrigins.join(" ")}`,
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
