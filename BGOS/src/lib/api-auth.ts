import type { Role } from "@prisma/client";
import type { Session } from "next-auth";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

type ApiAuthSuccess = {
  session: Session;
  user: Session["user"];
  response?: never;
};

type ApiAuthFailure = {
  session?: never;
  user?: never;
  response: NextResponse<{ error: string }>;
};

type ApiAuthResult = ApiAuthSuccess | ApiAuthFailure;

const unauthorized = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const forbidden = () =>
  NextResponse.json({ error: "Forbidden" }, { status: 403 });

export async function requireAuth(): Promise<ApiAuthResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { response: unauthorized() };
  }

  return { session, user: session.user };
}

export async function requireRole(roles: Role | Role[]): Promise<ApiAuthResult> {
  const result = await requireAuth();

  if (result.response) {
    return result;
  }

  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  if (!allowedRoles.includes(result.user.role)) {
    return { response: forbidden() };
  }

  return result;
}
