import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  BOSS_DOMAIN,
  EMPLOYEE_DOMAIN,
  getDomainType,
  isBossRole,
  isEmployeeRole,
} from "@/lib/domain";
import { getRoleRedirect } from "@/lib/role-redirect";

const PUBLIC_ROUTES = [
  "/",
  "/marketplace",
  "/marketplace/(.*)",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
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
  const host = req.headers.get("host") || "";
  const domainType = getDomainType(host);
  const session = req.auth;
  const isProd = process.env.NODE_ENV === "production";
  const role = (session?.user?.role as string | undefined) || "EMPLOYEE";

  if (pathname === "/" && session?.user) {
    return NextResponse.redirect(new URL(getRoleRedirect(role), req.url));
  }

  if (pathname === "/login" && session?.user) {
    return NextResponse.redirect(new URL(getRoleRedirect(role), req.url));
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) return NextResponse.next();
  if (pathname.startsWith("/_next/")) return NextResponse.next();

  if (!session?.user) {
    if (isProd) {
      if (domainType === "employee") {
        return NextResponse.redirect(
          new URL("/login", `https://${EMPLOYEE_DOMAIN}`),
        );
      }

      return NextResponse.redirect(new URL("/login", `https://${BOSS_DOMAIN}`));
    }

    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isProd) {
    if (domainType === "employee" && isBossRole(role)) {
      const redirectPath = getRoleRedirect(role);
      return NextResponse.redirect(
        new URL(redirectPath, `https://${BOSS_DOMAIN}`),
      );
    }

    if (domainType === "boss" && isEmployeeRole(role)) {
      const redirectPath = getRoleRedirect(role);
      return NextResponse.redirect(
        new URL(redirectPath, `https://${EMPLOYEE_DOMAIN}`),
      );
    }
  }

  if (role === "OWNER" && pathname.startsWith("/boss")) {
    return NextResponse.redirect(new URL("/internal", req.url));
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

  if (
    isEmployeeRole(role) &&
    (pathname.startsWith("/boss") || pathname.startsWith("/internal"))
  ) {
    return NextResponse.redirect(new URL(getRoleRedirect(role), req.url));
  }

  if (
    isBossRole(role) &&
    (pathname.startsWith("/bdm") || pathname.startsWith("/sde"))
  ) {
    return NextResponse.redirect(new URL(getRoleRedirect(role), req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
