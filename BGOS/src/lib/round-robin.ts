import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

async function getBGOSBDMs() {
  const owner = await prisma.user.findFirst({
    where: { email: "boss@bgos.online" },
    select: { businessId: true },
  });

  if (!owner?.businessId) return [];

  return prisma.user.findMany({
    where: {
      businessId: owner.businessId,
      role: "BDM",
      active: true,
    },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, businessId: true },
  });
}

export async function getNextBDM(trackerType: string) {
  const bdms = await getBGOSBDMs();
  if (bdms.length === 0) return null;

  return prisma.$transaction(
    async (tx) => {
      const last = await tx.roundRobinTracker.findFirst({
        where: { type: trackerType },
        orderBy: { createdAt: "desc" },
      });

      let nextIndex = 0;
      if (last) {
        const lastIndex = bdms.findIndex((bdm) => bdm.id === last.lastAssignedId);
        nextIndex = (lastIndex + 1) % bdms.length;
      }

      const next = bdms[nextIndex];

      await tx.roundRobinTracker.create({
        data: { type: trackerType, lastAssignedId: next.id },
      });

      return next;
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}
