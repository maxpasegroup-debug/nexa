import { NextResponse } from "next/server";

import { BLIZZWAY_ADMIN_MODEL, requireBlizzwayAdmin } from "@/lib/blizzway-admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireBlizzwayAdmin();
  if ("error" in auth) return auth.error;
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const where = {
    business: { type: { in: [BLIZZWAY_ADMIN_MODEL, "career7"] } },
    deletedAt: null,
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" as const } },
            { email: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const users = await prisma.user.findMany({
    where,
    take: 50,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      isActive: true,
      createdAt: true,
      business: { select: { id: true, name: true, type: true, plan: true } },
      career7CreditWallets: { select: { balance: true }, take: 1 },
      blizzwayBdpProfiles: { select: { headline: true, profileStrength: true }, take: 1 },
      blizzwayCompanionActivations: { where: { status: "ACTIVE" }, select: { id: true }, take: 10 },
      blizzwayPathwayLevelProgress: { select: { currentLevel: true, totalXp: true }, take: 1 },
    },
  });

  return NextResponse.json({
    users: users.map((user) => ({
      ...user,
      walletBalance: user.career7CreditWallets[0]?.balance ?? 0,
      bdp: user.blizzwayBdpProfiles[0] ?? null,
      activeCompanions: user.blizzwayCompanionActivations.length,
      pathwayProgress: user.blizzwayPathwayLevelProgress[0] ?? null,
      career7CreditWallets: undefined,
      blizzwayBdpProfiles: undefined,
      blizzwayCompanionActivations: undefined,
      blizzwayPathwayLevelProgress: undefined,
    })),
  });
}
