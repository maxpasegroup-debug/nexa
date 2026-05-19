import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { BOSS_DOMAIN } from "@/lib/domain";
import { getRoleRedirect } from "@/lib/role-redirect";

const PUBLIC_ROUTES = [
  "/",
  "/marketplace",
  "/marketplace/(.*)",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/nicejobs",
  "/accept-invite",
  "/workspace-preview",
  "/activate-trial",
  "/api/auth",
  "/api/register",
  "/api/forgot-password",
  "/api/reset-password",
  "/api/onboarding",
  "/api/onboarding/landing",
  "/api/marketplace/agents",
  "/api/marketplace/agents/(.*)",
  "/api/marketplace/interest",
  "/api/marketplace/notify",
];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) => {
    if (route === "/") return pathname === "/";
    const prefix = route.endsWith("/(.*)") ? route.slice(0, -5) : route;
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isProd = process.env.NODE_ENV === "production";
  const role = (session?.user?.role as string | undefined) || "EMPLOYEE";

  if (pathname === "/" && session?.user) {
    return NextResponse.redirect(new URL(getRoleRedirect(role), req.url));
  }

  if (pathname === "/login" && session?.user) {
    if (req.nextUrl.searchParams.get("businessModel") === "career7") {
      return NextResponse.redirect(new URL("/career7/dashboard", req.url));
    }

    return NextResponse.redirect(new URL(getRoleRedirect(role), req.url));
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) return NextResponse.next();
  if (pathname.startsWith("/_next/")) return NextResponse.next();

  if (!session?.user) {
    if (pathname.startsWith("/career7")) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("businessModel", "career7");
      loginUrl.searchParams.set("callbackUrl", `${pathname}${req.nextUrl.search}`);
      return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith("/nicejobs")) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("businessModel", "nicejobs");
      loginUrl.searchParams.set("callbackUrl", `${pathname}${req.nextUrl.search}`);
      return NextResponse.redirect(loginUrl);
    }

    if (isProd) {
      return NextResponse.redirect(new URL("/login", `https://${BOSS_DOMAIN}`));
    }

    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (role === "OWNER" && pathname.startsWith("/boss")) {
    return NextResponse.redirect(new URL("/internal", req.url));
  }

  // Legacy Blizzway compatibility route: accessible to all authenticated users.
  if (pathname.startsWith("/career7")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/nicejobs")) {
    return NextResponse.next();
  }

  const protectedByRole: Record<string, string[]> = {
    "/internal": ["OWNER", "ADMIN"],
    "/bdm": ["BDM", "OWNER", "ADMIN"],
    "/sde": ["SDE", "OWNER", "ADMIN"],
    "/boss": ["BOSS", "OWNER", "ADMIN"],
    "/app": ["EMPLOYEE", "OWNER", "ADMIN"],
  };

  for (const [prefix, allowedRoles] of Object.entries(protectedByRole)) {
    if (pathname.startsWith(prefix) && !allowedRoles.includes(role)) {
      return NextResponse.redirect(new URL(getRoleRedirect(role), req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|register|workspace-preview|activate-trial|marketplace).*)",
  ],
};
