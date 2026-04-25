import { NextResponse } from "next/server";

import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type DashboardMetrics = {
  healthScore: number;
  totalLeads: number;
  hotLeads: number;
  wonThisMonth: number;
  teamCount: number;
  revenueThisMonth: number;
  leadsThisWeek: number;
  conversionRate: number;
};

export async function getCurrentBusiness() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      role: true,
      businessId: true,
      business: {
        select: {
          id: true,
          healthScore: true,
        },
      },
    },
  });

  if (!user?.businessId || !user.business) {
    return {
      error: NextResponse.json(
        { error: "Business not found for this user." },
        { status: 400 },
      ),
    };
  }

  return { user, business: user.business };
}

export async function getDashboardMetrics(
  businessId: string,
  healthScore: number,
): Promise<DashboardMetrics> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastSevenDays = new Date(now);
  lastSevenDays.setDate(now.getDate() - 7);

  const [
    totalLeads,
    hotLeads,
    wonThisMonth,
    teamCount,
    leadsThisWeek,
  ] = await Promise.all([
    prisma.lead.count({ where: { businessId } }),
    prisma.lead.count({ where: { businessId, score: { gt: 70 } } }),
    prisma.lead.count({
      where: {
        businessId,
        status: "WON",
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.user.count({ where: { businessId } }),
    prisma.lead.count({
      where: {
        businessId,
        createdAt: { gte: lastSevenDays },
      },
    }),
  ]);

  return {
    healthScore,
    totalLeads,
    hotLeads,
    wonThisMonth,
    teamCount,
    revenueThisMonth: 0,
    leadsThisWeek,
    conversionRate:
      totalLeads > 0
        ? Math.round((wonThisMonth / totalLeads) * 1000) / 10
        : 0,
  };
}
