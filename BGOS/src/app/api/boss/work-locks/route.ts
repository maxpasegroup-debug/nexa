import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";

import auth from "@/lib/auth";
import { activeBossWorkLocksForUser, startBossWorkLock } from "@/lib/boss-work-locks";
import { requireInternalOwnerApi } from "@/lib/internal-owner";
import { prisma } from "@/lib/prisma";

function str(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function role(value: string): Role | null {
  if (value === "BDM" || value === "SDE") return value;
  return null;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all") === "true";
  const internalContext = all ? await requireInternalOwnerApi() : null;
  if (internalContext && "error" in internalContext) return internalContext.error;

  const locks = internalContext && !("error" in internalContext)
    ? await prisma.bossWorkLock.findMany({
        where: { businessId: internalContext.business.id, status: "ACTIVE" },
        include: { starter: { select: { id: true, name: true, email: true } } },
        orderBy: { startedAt: "desc" },
      })
    : await activeBossWorkLocksForUser({
        id: session.user.id,
        role: session.user.role,
        businessId: session.user.businessId,
      });

  return NextResponse.json({
    locks: locks.map((lock) => ({
      id: lock.id,
      targetType: lock.targetType,
      targetId: lock.targetId,
      targetRole: lock.targetRole,
      message: lock.message,
      startedAt: lock.startedAt.toISOString(),
      bossName: lock.starter.name,
    })),
  });
}

export async function POST(request: Request) {
  const context = await requireInternalOwnerApi();
  if ("error" in context) return context.error;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const targetRole = role(str(body.targetRole));
  const targetType = str(body.targetType);
  const targetId = str(body.targetId);

  if (!targetRole || !targetType || !targetId) {
    return NextResponse.json({ error: "targetType, targetId and targetRole are required." }, { status: 400 });
  }

  const lock = await startBossWorkLock(context.business.id, context.owner.id, {
    targetType,
    targetId,
    targetRole,
    targetUserId: str(body.targetUserId) || null,
    message:
      str(body.message) ||
      `Boss is operating ${targetType} ${targetId}. Hold actions and messages until Boss finishes.`,
  });

  return NextResponse.json({ lock });
}
