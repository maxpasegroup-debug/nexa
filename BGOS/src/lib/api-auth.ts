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
type AllowedRole = "OWNER" | "BDM" | "SDE" | "BOSS" | "EMPLOYEE" | "ADMIN";

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
  if (!allowedRoles.includes(result.user.role as Role)) {
    return { response: forbidden() };
  }

  return result;
}

export async function withRole(
  allowedRoles: AllowedRole[],
  handler: (session: Session) => Promise<Response>,
): Promise<Response> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!allowedRoles.includes(session.user.role as AllowedRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!session.user.isActive) {
    return NextResponse.json({ error: "Account suspended" }, { status: 403 });
  }

  return handler(session);
}

export const ownerOnly = (handler: (session: Session) => Promise<Response>) =>
  withRole(["OWNER", "ADMIN"], handler);
export const bdmOnly = (handler: (session: Session) => Promise<Response>) =>
  withRole(["BDM", "OWNER", "ADMIN"], handler);
export const sdeOnly = (handler: (session: Session) => Promise<Response>) =>
  withRole(["SDE", "OWNER", "ADMIN"], handler);
export const bossOnly = (handler: (session: Session) => Promise<Response>) =>
  withRole(["BOSS", "OWNER", "ADMIN"], handler);
export const staffOnly = (handler: (session: Session) => Promise<Response>) =>
  withRole(["OWNER", "BDM", "SDE", "ADMIN"], handler);

export function assertCompanyAccess(session: Session, businessId: string) {
  if (["EMPLOYEE", "BOSS"].includes(session.user.role as string)) {
    if (session.user.companyId !== businessId) {
      throw new Error("Forbidden - cross-company access");
    }
  }
}
