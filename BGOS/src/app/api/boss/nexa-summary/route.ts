import { NextResponse } from "next/server";

import { getCurrentBusiness, getDashboardMetrics } from "@/lib/dashboard/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const context = await getCurrentBusiness();

  if (context.error) {
    return context.error;
  }

  const [metrics, insights, actions, activityCount] = await Promise.all([
    getDashboardMetrics(context.business.id, context.business.healthScore),
    prisma.nexaInsight.findMany({
      where: { businessId: context.business.id, read: false },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        type: true,
        message: true,
        action: true,
        createdAt: true,
      },
    }),
    prisma.nexaAction.findMany({
      where: { businessId: context.business.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        type: true,
        description: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.activityLog.count({ where: { businessId: context.business.id } }),
  ]);

  return NextResponse.json({
    briefing:
      insights.length > 0
        ? insights.map((insight) => insight.message)
        : [],
    insights,
    recommendations: insights
      .map((insight) => insight.action)
      .filter((action): action is string => Boolean(action)),
    performance: {
      healthScore: metrics.healthScore,
      totalLeads: metrics.totalLeads,
      hotLeads: metrics.hotLeads,
      wonThisMonth: metrics.wonThisMonth,
      teamCount: metrics.teamCount,
      conversionRate: metrics.conversionRate,
      activityCount,
    },
    actions,
  });
}
