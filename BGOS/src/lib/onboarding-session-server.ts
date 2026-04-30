import type { Prisma, Role } from "@prisma/client";
import { NextResponse } from "next/server";

import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function jsonArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export async function requireSessionUser(roles: Role[]) {
  const session = await auth();
  if (!session?.user?.id || !roles.includes(session.user.role)) {
    return { error: jsonError("Forbidden", 403), user: null };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      businessId: true,
      business: { select: { name: true } },
    },
  });

  if (!user || !roles.includes(user.role)) {
    return { error: jsonError("Forbidden", 403), user: null };
  }

  return { error: null, user };
}

export async function getOwnedOnboardingSession(
  sessionId: string,
  userId: string,
  role: Role,
) {
  const session = await prisma.onboardingSession.findFirst({
    where: {
      id: sessionId,
      ...(role === "BDM" ? { bdmId: userId } : {}),
      ...(role === "SDE" ? { sdeId: userId } : {}),
    },
    include: {
      lead: true,
      bdm: { select: { id: true, name: true, email: true, businessId: true } },
      sde: { select: { id: true, name: true, email: true, businessId: true } },
      employees: true,
      clarifications: {
        include: {
          raiser: { select: { id: true, name: true, email: true } },
          answerer: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return session;
}

export async function syncEmployeeData(sessionId: string) {
  const employees = await prisma.onboardingEmployee.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });

  await prisma.onboardingSession.update({
    where: { id: sessionId },
    data: {
      employeeData: employees.map((employee) => ({
        id: employee.id,
        name: employee.name,
        title: employee.title,
        email: employee.email,
        phone: employee.phone,
        reportsTo: employee.reportsTo,
        directReports: employee.directReports,
        systemRole: employee.systemRole,
        assignedPipelines: employee.assignedPipelines,
        operatingProcedures: employee.operatingProcedures,
        dailyTasks: employee.dailyTasks,
        decisionAuthority: employee.decisionAuthority,
        communicationPrefs: employee.communicationPrefs,
        nexaFlags: employee.nexaFlags,
        completeness: employee.completeness,
      })) as Prisma.InputJsonValue,
    },
  });

  return employees;
}

export function dueInHours(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}
