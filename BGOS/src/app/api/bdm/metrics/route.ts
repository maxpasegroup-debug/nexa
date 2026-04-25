import { NextResponse } from "next/server";

import { getBdmContext, monthBounds, todayBounds } from "@/lib/bdm/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const context = await getBdmContext();

    if (context.error) return context.error;

    const now = new Date();
    const month = monthBounds(now);
    const today = todayBounds(now);

    const [
      myLeadsTotal,
      myLeadsNew,
      myLeadsHot,
      followUpsDueToday,
      followUpsOverdue,
      wonThisMonth,
      revenueAgg,
      callsToday,
      target,
      teamUsers,
      wonByBdm,
      leadsForResponseTime,
    ] = await Promise.all([
      prisma.lead.count({ where: { assignedTo: context.user.id } }),
      prisma.lead.count({ where: { assignedTo: context.user.id, status: "NEW" } }),
      prisma.lead.count({ where: { assignedTo: context.user.id, score: { gt: 70 } } }),
      prisma.lead.count({
        where: {
          assignedTo: context.user.id,
          followUpDate: { gte: today.start, lt: today.end },
          status: { notIn: ["WON", "LOST"] },
        },
      }),
      prisma.lead.count({
        where: {
          assignedTo: context.user.id,
          followUpDate: { lt: today.start },
          status: { notIn: ["WON", "LOST"] },
        },
      }),
      prisma.lead.count({
        where: {
          assignedTo: context.user.id,
          status: "WON",
          wonAt: { gte: month.start, lt: month.end },
        },
      }),
      prisma.lead.aggregate({
        where: {
          assignedTo: context.user.id,
          status: "WON",
          wonAt: { gte: month.start, lt: month.end },
        },
        _sum: { value: true },
      }),
      prisma.callLog.count({
        where: {
          userId: context.user.id,
          createdAt: { gte: today.start, lt: today.end },
        },
      }),
      prisma.target.findUnique({
        where: {
          userId_month_year: {
            userId: context.user.id,
            month: month.month,
            year: month.year,
          },
        },
      }),
      prisma.user.count({ where: { businessId: context.businessId, role: "BDM" } }),
      prisma.lead.groupBy({
        by: ["assignedTo"],
        where: {
          businessId: context.businessId,
          status: "WON",
          assignedTo: { not: null },
          wonAt: { gte: month.start, lt: month.end },
        },
        _count: { _all: true },
        orderBy: { _count: { assignedTo: "desc" } },
      }),
      prisma.lead.findMany({
        where: {
          assignedTo: context.user.id,
          lastContactAt: { not: null },
        },
        select: { createdAt: true, lastContactAt: true },
        take: 100,
      }),
    ]);

    const responseTimes = leadsForResponseTime
      .filter((lead) => lead.lastContactAt)
      .map(
        (lead) =>
          (lead.lastContactAt!.getTime() - lead.createdAt.getTime()) /
          (1000 * 60 * 60),
      )
      .filter((hours) => hours >= 0);
    const avgResponseTime =
      responseTimes.length > 0
        ? Math.round(
            (responseTimes.reduce((sum, hours) => sum + hours, 0) /
              responseTimes.length) *
              10,
          ) / 10
        : 0;
    const revenueThisMonth = revenueAgg._sum.value ?? 0;
    const wonTarget = target?.wonTarget ?? 0;
    const revenueTarget = target?.revenueTarget ?? 0;
    const teamRank =
      wonByBdm.findIndex((item) => item.assignedTo === context.user.id) + 1 || teamUsers;

    return NextResponse.json({
      myLeadsTotal,
      myLeadsNew,
      myLeadsHot,
      followUpsDueToday,
      followUpsOverdue,
      wonThisMonth,
      wonTarget,
      wonProgress: wonTarget > 0 ? Math.round((wonThisMonth / wonTarget) * 100) : 0,
      revenueThisMonth,
      revenueTarget,
      revenueProgress:
        revenueTarget > 0 ? Math.round((revenueThisMonth / revenueTarget) * 100) : 0,
      callsToday,
      avgResponseTime,
      conversionRate:
        myLeadsTotal > 0 ? Math.round((wonThisMonth / myLeadsTotal) * 1000) / 10 : 0,
      teamRank,
      teamSize: teamUsers,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch BDM metrics." },
      { status: 500 },
    );
  }
}
