import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/my-pathway",
  "/learning-garden",
  "/earning-universe",
  "/magic-market",
  "/companions",
  "/quick-boosts",
  "/soul-vault",
  "/wallet",
  "/settings",
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

function isProtectedPath(pathname: string) {
  return protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function loginRedirect(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("returnTo", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  if (!isProtectedPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  try {
    const response = await fetch(new URL("/api/career7/health", getBgosBaseUrl()), {
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return loginRedirect(request);
    }

    return NextResponse.next();
  } catch {
    return loginRedirect(request);
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/my-pathway/:path*",
    "/learning-garden/:path*",
    "/earning-universe/:path*",
    "/magic-market/:path*",
    "/companions/:path*",
    "/quick-boosts/:path*",
    "/soul-vault/:path*",
    "/wallet/:path*",
    "/settings/:path*",
  ],
};
