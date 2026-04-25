import { redirect } from "next/navigation";

import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BossDashboard } from "@/components/boss/boss-dashboard";

async function getMetrics(businessId: string, healthScore: number) {
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

export default async function BossPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      businessId: true,
      business: {
        select: {
          id: true,
          name: true,
          healthScore: true,
        },
      },
    },
  });

  if (!user?.businessId || !user.business) {
    redirect("/onboarding");
  }

  const [initialMetrics, activity, insights] = await Promise.all([
    getMetrics(user.business.id, user.business.healthScore),
    prisma.activityLog.findMany({
      where: { businessId: user.business.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        action: true,
        entity: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    }),
    prisma.nexaInsight.findMany({
      where: {
        businessId: user.business.id,
        read: false,
      },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        type: true,
        message: true,
        action: true,
      },
    }),
  ]);

  return (
    <BossDashboard
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }}
      business={user.business}
      initialMetrics={initialMetrics}
      initialActivity={activity.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
      }))}
      initialInsights={insights}
    />
  );
}
