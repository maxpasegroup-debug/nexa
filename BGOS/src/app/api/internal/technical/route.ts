import { NextResponse } from "next/server";

import { startBossWorkLock } from "@/lib/boss-work-locks";
import { requireInternalOwnerApi } from "@/lib/internal-owner";
import { prisma } from "@/lib/prisma";

function str(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  const context = await requireInternalOwnerApi();
  if ("error" in context) return context.error;

  const sdes = await prisma.user.findMany({
    where: { businessId: context.business.id, role: "SDE" },
    select: {
      id: true,
      name: true,
      email: true,
      active: true,
      tasks: {
        where: { status: { not: "DONE" } },
        orderBy: { updatedAt: "desc" },
        take: 20,
      },
      sdeOnboardingSessions: {
        where: { status: { in: ["SUBMITTED", "SDE_BUILDING", "CLARIFICATION_NEEDED", "SDE_APPROVED"] } },
        select: {
          id: true,
          status: true,
          selectedPlan: true,
          completenessScore: true,
          submittedAt: true,
          updatedAt: true,
          companyData: true,
          lead: { select: { company: true, name: true } },
        },
        orderBy: { updatedAt: "desc" },
      },
      sdeInstallations: {
        where: { status: "SDE_BUILDING" },
        include: {
          agent: { select: { name: true, slug: true } },
          business: { select: { name: true, clientId: true } },
        },
        orderBy: { updatedAt: "desc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ sdes });
}

export async function POST(request: Request) {
  const context = await requireInternalOwnerApi();
  if ("error" in context) return context.error;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const targetType = str(body.targetType);
  const targetId = str(body.targetId);
  const targetUserId = str(body.targetUserId) || null;

  if (!targetType || !targetId) {
    return NextResponse.json({ error: "targetType and targetId are required." }, { status: 400 });
  }

  const lock = await startBossWorkLock(context.business.id, context.owner.id, {
    targetType,
    targetId,
    targetRole: "SDE",
    targetUserId,
    message: str(body.message) || `Boss is operating ${targetType} on behalf of SDE. SDE must hold updates/messages until Boss finishes.`,
  });

  await prisma.activityLog.create({
    data: {
      businessId: context.business.id,
      userId: context.owner.id,
      action: "Boss mode started for technical work",
      entity: targetType,
      entityId: targetId,
      meta: { targetUserId },
    },
  });

  return NextResponse.json({ lock });
}
