import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";

import { employeeStats, serializeEmployee, VALID_ROLES } from "@/lib/internal-control";
import { requireInternalOwnerApi } from "@/lib/internal-owner";
import { prisma } from "@/lib/prisma";

function str(value: unknown) {
  return typeof value === "string" ? value.trim() : undefined;
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const context = await requireInternalOwnerApi();
  if ("error" in context) return context.error;

  const user = await prisma.user.findFirst({
    where: { id: params.id, businessId: context.business.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      active: true,
      status: true,
      createdAt: true,
      joinedAt: true,
      updatedAt: true,
      defaultPassword: true,
    },
  });

  if (!user) return NextResponse.json({ error: "Employee not found." }, { status: 404 });

  const stats = await employeeStats(user.id);
  return NextResponse.json({ employee: serializeEmployee(user, stats) });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const context = await requireInternalOwnerApi();
  if ("error" in context) return context.error;

  const body = (await request.json()) as Record<string, unknown>;
  const role = str(body.role);
  if (role && !VALID_ROLES.includes(role as Role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const email = str(body.email)?.toLowerCase();
  if (email) {
    const existing = await prisma.user.findFirst({
      where: { email, id: { not: params.id } },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ error: "Email already exists." }, { status: 400 });
    }
  }

  const status = str(body.status);
  const user = await prisma.user.update({
    where: { id: params.id },
    data: {
      ...(str(body.name) ? { name: str(body.name) } : {}),
      ...(email ? { email } : {}),
      ...(str(body.phone) !== undefined ? { phone: str(body.phone) } : {}),
      ...(role ? { role: role as Role } : {}),
      ...(typeof body.isActive === "boolean" ? { active: body.isActive } : {}),
      ...(status ? { status, active: status === "ACTIVE" } : {}),
      ...(str(body.joinedAt) ? { joinedAt: new Date(str(body.joinedAt)!) } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      active: true,
      status: true,
      createdAt: true,
      joinedAt: true,
      updatedAt: true,
      defaultPassword: true,
    },
  });

  if (typeof body.revenueTarget === "number") {
    const now = new Date();
    await prisma.target.upsert({
      where: {
        userId_month_year: {
          userId: params.id,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },
      },
      create: {
        userId: params.id,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        revenueTarget: body.revenueTarget,
      },
      update: { revenueTarget: body.revenueTarget },
    });
  }

  const stats = await employeeStats(user.id);
  return NextResponse.json({ employee: serializeEmployee(user, stats) });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const context = await requireInternalOwnerApi();
  if ("error" in context) return context.error;

  const [activeLeads, pendingBuilds, openTickets] = await Promise.all([
    prisma.lead.count({ where: { assignedTo: params.id, status: { notIn: ["WON", "LOST"] } } }),
    prisma.onboardingSession.count({
      where: {
        OR: [{ bdmId: params.id }, { sdeId: params.id }],
        status: { in: ["COLLECTING", "SUBMITTED", "SDE_BUILDING", "CLARIFICATION_NEEDED"] },
      },
    }),
    prisma.task.count({ where: { assignedTo: params.id, status: { not: "DONE" } } }),
  ]);

  if (activeLeads > 0) {
    return NextResponse.json(
      { error: `Cannot delete — user has ${activeLeads} active leads. Archive instead.` },
      { status: 400 },
    );
  }
  if (pendingBuilds > 0 || openTickets > 0) {
    return NextResponse.json(
      { error: `Cannot delete — user has ${pendingBuilds} pending builds and ${openTickets} open tickets. Archive instead.` },
      { status: 400 },
    );
  }

  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
