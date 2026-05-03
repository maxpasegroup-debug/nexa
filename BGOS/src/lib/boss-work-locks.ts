import type { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type BossLockTarget = {
  targetType: string;
  targetId: string;
  targetRole: Role;
  targetUserId?: string | null;
  message: string;
};

export async function startBossWorkLock(
  businessId: string,
  bossId: string,
  target: BossLockTarget,
) {
  await prisma.bossWorkLock.updateMany({
    where: {
      targetType: target.targetType,
      targetId: target.targetId,
      status: "ACTIVE",
    },
    data: {
      status: "FINISHED",
      finishedBy: bossId,
      finishedAt: new Date(),
    },
  });

  return prisma.bossWorkLock.create({
    data: {
      businessId,
      startedBy: bossId,
      targetType: target.targetType,
      targetId: target.targetId,
      targetRole: target.targetRole,
      targetUserId: target.targetUserId,
      message: target.message,
    },
  });
}

export async function finishBossWorkLock(lockId: string, bossId: string) {
  return prisma.bossWorkLock.update({
    where: { id: lockId },
    data: {
      status: "FINISHED",
      finishedBy: bossId,
      finishedAt: new Date(),
    },
  });
}

export async function activeBossWorkLocksForUser(user: {
  id: string;
  role: Role;
  businessId?: string | null;
}) {
  if (!user.businessId) return [];

  return prisma.bossWorkLock.findMany({
    where: {
      businessId: user.businessId,
      status: "ACTIVE",
      targetRole: user.role,
      OR: [{ targetUserId: user.id }, { targetUserId: null }],
    },
    include: {
      starter: { select: { id: true, name: true, email: true } },
    },
    orderBy: { startedAt: "desc" },
  });
}
