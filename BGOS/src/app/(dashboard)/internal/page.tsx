import { redirect } from "next/navigation";

import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  BgosInternalDashboard,
  type InternalBusiness,
  type InternalTeamMember,
} from "@/components/internal/bgos-internal-dashboard";

function latestDate(...values: Array<Date | null | undefined>) {
  const timestamps = values
    .filter((value): value is Date => Boolean(value))
    .map((value) => value.getTime());

  if (timestamps.length === 0) return null;
  return new Date(Math.max(...timestamps));
}

function planForUserCount(userCount: number) {
  if (userCount >= 20) return "SCALE";
  if (userCount >= 6) return "GROWTH";
  return "STARTER";
}

function isActive(date: Date | null) {
  if (!date) return false;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return date >= sevenDaysAgo;
}

export default async function InternalPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const owner = await prisma.user.findUnique({
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

  if (owner?.email !== "boss@bgos.online" || owner.role !== "OWNER") {
    redirect("/login");
  }

  const internalBusiness =
    owner.business ??
    (await prisma.business.findFirst({
      where: { name: "BGOS" },
      select: {
        id: true,
        name: true,
        healthScore: true,
      },
    }));

  if (!internalBusiness) {
    redirect("/login");
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const customerBusinessWhere = {
    id: { not: internalBusiness.id },
  };

  const [
    totalCustomers,
    totalUsers,
    totalLeads,
    newThisMonth,
    recentBusinesses,
    teamMembers,
    savedInsights,
  ] = await Promise.all([
    prisma.business.count({ where: customerBusinessWhere }),
    prisma.user.count(),
    prisma.lead.count(),
    prisma.business.count({
      where: {
        ...customerBusinessWhere,
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.business.findMany({
      where: customerBusinessWhere,
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        healthScore: true,
        createdAt: true,
        users: {
          select: {
            email: true,
            role: true,
            updatedAt: true,
          },
        },
        activityLogs: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
    }),
    prisma.user.findMany({
      where: {
        businessId: internalBusiness.id,
        role: { in: ["BDM", "SDE"] },
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        defaultPassword: true,
        activityLogs: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
        leadActivities: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
        callLogs: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
        tasks: {
          orderBy: { updatedAt: "desc" },
          take: 1,
          select: { updatedAt: true },
        },
      },
    }),
    prisma.nexaInsight.findMany({
      where: { businessId: internalBusiness.id, read: false },
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

  const businesses: InternalBusiness[] = recentBusinesses.map((business) => {
    const boss =
      business.users.find((user) => user.role === "BOSS") ??
      business.users.find((user) => user.role === "OWNER") ??
      business.users[0];
    const lastActivity = latestDate(
      business.activityLogs[0]?.createdAt,
      ...business.users.map((user) => user.updatedAt),
    );

    return {
      id: business.id,
      name: business.name,
      bossEmail: boss?.email ?? "No boss assigned",
      plan: planForUserCount(business.users.length),
      joinedAt: business.createdAt.toISOString(),
      healthScore: business.healthScore,
      active: isActive(lastActivity),
    };
  });

  const bgosTeam: InternalTeamMember[] = teamMembers.map((member) => {
    const lastActiveAt = latestDate(
      member.activityLogs[0]?.createdAt,
      member.leadActivities[0]?.createdAt,
      member.callLogs[0]?.createdAt,
      member.tasks[0]?.updatedAt,
      member.updatedAt,
    );

    return {
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      createdAt: member.createdAt.toISOString(),
      defaultPassword: member.defaultPassword,
      lastLoginAt: lastActiveAt?.toISOString() ?? null,
    };
  });

  const validInsights = savedInsights.filter((insight) => {
    const text = `${insight.message} ${insight.action ?? ""}`.toLowerCase();
    if (totalCustomers === 0 && text.includes("customer")) return false;
    if (totalLeads === 0 && text.includes("lead")) return false;
    if (teamMembers.length === 0 && text.includes("team")) return false;
    return true;
  });

  return (
    <BgosInternalDashboard
      user={{
        id: owner.id,
        name: owner.name,
        email: owner.email,
        role: owner.role,
      }}
      business={{
        id: internalBusiness.id,
        name: internalBusiness.name,
        healthScore: internalBusiness.healthScore,
      }}
      metrics={{
        totalCustomers,
        totalUsers,
        totalLeads,
        newThisMonth,
      }}
      businesses={businesses}
      teamMembers={bgosTeam}
      insights={validInsights.map((insight) => ({
        ...insight,
        action: insight.action ?? null,
      }))}
    />
  );
}
