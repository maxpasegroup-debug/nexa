import { NextResponse } from "next/server";

import auth from "@/lib/auth";
import { monthBounds } from "@/lib/bdm/server";
import { prisma } from "@/lib/prisma";

function latestDate(...values: Array<Date | null | undefined>) {
  const timestamps = values
    .filter((value): value is Date => Boolean(value))
    .map((value) => value.getTime());

  if (timestamps.length === 0) return null;
  return new Date(Math.max(...timestamps));
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const boss = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, businessId: true },
    });

    if (!boss?.businessId || boss.role !== "BOSS") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const month = monthBounds();
    const bdms = await prisma.user.findMany({
      where: { businessId: boss.businessId, role: "BDM" },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        role: true,
        targets: {
          where: { month: month.month, year: month.year },
          take: 1,
        },
        callLogs: {
          where: { createdAt: { gte: month.start, lt: month.end } },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        },
        leadActivities: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
    });

    const performance = await Promise.all(
      bdms.map(async (bdm) => {
        const [leadsAssigned, wonThisMonth] = await Promise.all([
          prisma.lead.count({ where: { assignedTo: bdm.id } }),
          prisma.lead.count({
            where: {
              assignedTo: bdm.id,
              status: "WON",
              wonAt: { gte: month.start, lt: month.end },
            },
          }),
        ]);
        const target = bdm.targets[0];
        const conversionRate =
          leadsAssigned > 0
            ? Math.round((wonThisMonth / leadsAssigned) * 1000) / 10
            : 0;

        return {
          id: bdm.id,
          name: bdm.name,
          role: bdm.role,
          leadsAssigned,
          wonThisMonth,
          wonTarget: target?.wonTarget ?? 0,
          leadsTarget: target?.leadsTarget ?? 0,
          revenueTarget: target?.revenueTarget ?? 0,
          conversionRate,
          callsThisMonth: bdm.callLogs.length,
          lastActiveAt: latestDate(
            bdm.callLogs[0]?.createdAt,
            bdm.leadActivities[0]?.createdAt,
          )?.toISOString() ?? null,
        };
      }),
    );

    const ranked = performance
      .sort((a, b) => b.conversionRate - a.conversionRate)
      .map((bdm, index) => ({ ...bdm, teamRank: index + 1 }));

    return NextResponse.json({ bdms: ranked });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch team performance." },
      { status: 500 },
    );
  }
}
