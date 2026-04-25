import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/boss", "/bdm", "/sde", "/onboarding"];

type OnboardingStatus = {
  completed: boolean;
  step: number;
  businessId: string | null;
};

function dashboardPathForRole(role?: string) {
  if (role === "BOSS") {
    return "/boss";
  }

  if (role === "BDM") {
    return "/bdm";
  }

  if (role === "SDE") {
    return "/sde";
  }

  return "/login";
}

function canAccessRoute(pathname: string, role?: string) {
  if (pathname.startsWith("/onboarding")) {
    return true;
  }

  if (pathname.startsWith("/boss")) {
    return role === "BOSS";
  }

  if (pathname.startsWith("/bdm")) {
    return role === "BDM" || role === "BOSS";
  }

  if (pathname.startsWith("/sde")) {
    return role === "SDE" || role === "BOSS";
  }

  return true;
}

async function getOnboardingStatus(request: NextRequest) {
  try {
    const statusUrl = new URL("/api/onboarding/status", request.nextUrl);
    const response = await fetch(statusUrl, {
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as OnboardingStatus;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.href);

    return NextResponse.redirect(loginUrl);
  }

  if (token) {
    const role = token.role as string | undefined;
    const dashboardPath = dashboardPathForRole(role);
    const status =
      pathname === "/login" || isProtectedRoute
        ? await getOnboardingStatus(request)
        : null;

    if (status && !status.completed && pathname !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", request.nextUrl));
    }

    if (status?.completed) {
      if (pathname === "/login" || pathname.startsWith("/onboarding")) {
        return NextResponse.redirect(new URL(dashboardPath, request.nextUrl));
      }

      if (
        isProtectedRoute &&
        !canAccessRoute(pathname, role)
      ) {
        return NextResponse.redirect(new URL(dashboardPath, request.nextUrl));
      }
    }

    if (!status) {
      if (pathname === "/login") {
        return NextResponse.redirect(new URL(dashboardPath, request.nextUrl));
      }

      if (
        isProtectedRoute &&
        !canAccessRoute(pathname, role)
      ) {
        return NextResponse.redirect(new URL(dashboardPath, request.nextUrl));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/boss/:path*",
    "/bdm/:path*",
    "/sde/:path*",
    "/onboarding",
    "/onboarding/:path*",
    "/login",
  ],
};
