import { redirect } from "next/navigation";

import { BdmDashboard } from "@/components/bdm/bdm-dashboard";
import type { BdmMetrics } from "@/components/bdm/performance-card";
import auth from "@/lib/auth";
import { filterBriefTasksForBdm } from "@/lib/bdm/brief-safety";
import { monthBounds, todayBounds } from "@/lib/bdm/server";
import {
  calcMonthlyEarnings,
  getCurrentSlab,
  getNextMilestone,
} from "@/lib/commission";
import { createChatCompletionText } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

const BRIEF_SYSTEM_PROMPT =
  "You are NEXA, the AI CEO. Generate a morning brief for this BDM. Return only a JSON object with these fields: greeting (string - it must reference commission data: 'Good morning [name]. You have earned Rs [total] this month with [X] days left. [nextMilestone]. Your hottest lead is [topLead name] - call them first.'), tasks (array of 5 objects each with: title string, priority 'high'/'medium'/'low', leadId string or null, type 'follow_up'/'new_lead'/'demo'/'proposal'/'admin'), insights (array of 3 strings - each a sharp one-line sales tip for today). No other text.";

type BriefTask = {
  title: string;
  priority: "high" | "medium" | "low";
  leadId: string | null;
  leadName?: string | null;
  type: "follow_up" | "new_lead" | "demo" | "proposal" | "admin";
};

type BriefData = {
  greeting: string;
  tasks: BriefTask[];
  insights: string[];
};

const taskTypes = ["follow_up", "new_lead", "demo", "proposal", "admin"];
const priorities = ["high", "medium", "low"];

function sanitizeBrief(raw: unknown, userName: string): BriefData {
  const object =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};
  const tasks = Array.isArray(object.tasks) ? object.tasks : [];
  const insights = Array.isArray(object.insights) ? object.insights : [];

  return {
    greeting:
      typeof object.greeting === "string"
        ? object.greeting
        : `Good morning, ${userName}. Start with your hottest follow-up and keep momentum high.`,
    tasks: tasks.slice(0, 5).map((task, index) => {
      const item =
        task && typeof task === "object" && !Array.isArray(task)
          ? (task as Record<string, unknown>)
          : {};
      const priority = String(item.priority ?? "medium");
      const type = String(item.type ?? "follow_up");

      return {
        title:
          typeof item.title === "string"
            ? item.title
            : `Follow up with priority lead ${index + 1}`,
        priority: priorities.includes(priority)
          ? (priority as BriefTask["priority"])
          : "medium",
        leadId: typeof item.leadId === "string" ? item.leadId : null,
        type: taskTypes.includes(type) ? (type as BriefTask["type"]) : "follow_up",
      };
    }),
    insights: insights
      .slice(0, 3)
      .map((insight) => String(insight))
      .filter(Boolean),
  };
}

function fallbackBrief(userName: string, dueLeadId?: string | null): BriefData {
  return {
    greeting: `Good morning, ${userName}. Nexa will brief you once your company has activity data.`,
    tasks: dueLeadId
      ? [
          {
            title: "Follow up with your overdue lead",
            priority: "high" as const,
            leadId: dueLeadId,
            type: "follow_up" as const,
          },
        ]
      : [],
    insights: [],
  };
}

async function getMetrics(userId: string, businessId: string): Promise<BdmMetrics> {
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
    prisma.lead.count({ where: { assignedTo: userId } }),
    prisma.lead.count({ where: { assignedTo: userId, status: "NEW" } }),
    prisma.lead.count({ where: { assignedTo: userId, score: { gt: 70 } } }),
    prisma.lead.count({
      where: {
        assignedTo: userId,
        followUpDate: { gte: today.start, lt: today.end },
        status: { notIn: ["WON", "LOST"] },
      },
    }),
    prisma.lead.count({
      where: {
        assignedTo: userId,
        followUpDate: { lt: today.start },
        status: { notIn: ["WON", "LOST"] },
      },
    }),
    prisma.lead.count({
      where: {
        assignedTo: userId,
        status: "WON",
        wonAt: { gte: month.start, lt: month.end },
      },
    }),
    prisma.lead.aggregate({
      where: {
        assignedTo: userId,
        status: "WON",
        wonAt: { gte: month.start, lt: month.end },
      },
      _sum: { value: true },
    }),
    prisma.callLog.count({
      where: { userId, createdAt: { gte: today.start, lt: today.end } },
    }),
    prisma.target.findUnique({
      where: {
        userId_month_year: {
          userId,
          month: month.month,
          year: month.year,
        },
      },
    }),
    prisma.user.count({ where: { businessId, role: "BDM" } }),
    prisma.lead.groupBy({
      by: ["assignedTo"],
      where: {
        businessId,
        status: "WON",
        assignedTo: { not: null },
        wonAt: { gte: month.start, lt: month.end },
      },
      _count: { _all: true },
      orderBy: { _count: { assignedTo: "desc" } },
    }),
    prisma.lead.findMany({
      where: { assignedTo: userId, lastContactAt: { not: null } },
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
  const rankIndex = wonByBdm.findIndex((item) => item.assignedTo === userId);

  return {
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
    teamRank: rankIndex >= 0 ? rankIndex + 1 : Math.max(teamUsers, 1),
    teamSize: Math.max(teamUsers, 1),
  };
}

async function getOrCreateBrief(userId: string, userName: string) {
  const today = todayBounds();
  const existing = await prisma.dailyBrief.findFirst({
    where: { userId, date: { gte: today.start, lt: today.end } },
    orderBy: { createdAt: "desc" },
  });

  if (existing) return existing;

  const month = monthBounds();
  const totalDays = new Date(month.year, month.month, 0).getDate();
  const daysRemaining = Math.max(0, totalDays - new Date().getDate());
  const [
    statusCounts,
    dueLeads,
    staleLeads,
    wonThisMonth,
    target,
    commission,
    slab,
    dealsThisMonth,
    portfolioCounts,
    trialAtRisk,
  ] =
    await Promise.all([
      prisma.lead.groupBy({
        by: ["status"],
        where: { assignedTo: userId },
        _count: { _all: true },
      }),
      prisma.lead.findMany({
        where: {
          assignedTo: userId,
          followUpDate: { lte: today.end },
          status: { notIn: ["WON", "LOST"] },
        },
        select: { id: true, name: true, status: true, followUpDate: true, score: true },
        take: 20,
      }),
      prisma.lead.findMany({
        where: {
          assignedTo: userId,
          createdAt: { lte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
          lastContactAt: null,
          status: { notIn: ["WON", "LOST"] },
        },
        select: { id: true, name: true, status: true, createdAt: true, score: true },
        take: 20,
      }),
      prisma.lead.count({
        where: {
          assignedTo: userId,
          status: "WON",
          wonAt: { gte: month.start, lt: month.end },
        },
      }),
      prisma.target.findUnique({
        where: {
          userId_month_year: { userId, month: month.month, year: month.year },
        },
      }),
      calcMonthlyEarnings(userId, month.month, month.year),
      getCurrentSlab(userId, month.month, month.year),
      prisma.commission.count({
        where: {
          userId,
          month: month.month,
          year: month.year,
          type: "FIRST_SALE",
          status: { not: "CLAWBACK" },
        },
      }),
      prisma.customerPortfolio.groupBy({
        by: ["status"],
        where: { userId, status: { in: ["PAYING", "TRIAL"] } },
        _count: { _all: true },
      }),
      prisma.customerPortfolio.count({
        where: {
          userId,
          status: "TRIAL",
          trialEndsAt: { lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);
  const topLead = [...dueLeads, ...staleLeads].sort((a, b) => b.score - a.score)[0];
  const payingCount =
    portfolioCounts.find((item) => item.status === "PAYING")?._count._all ?? 0;
  const nextMilestone = getNextMilestone(dealsThisMonth);

  let brief = fallbackBrief(userName, dueLeads[0]?.id);

  try {
    const text = await createChatCompletionText({
      maxTokens: 700,
      system: BRIEF_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            name: userName,
            statusCounts,
            dueLeads,
            staleLeads,
            wonThisMonth,
            wonTarget: target?.wonTarget ?? 0,
            commissionData: {
              earnedThisMonth: commission.total,
              firstSale: commission.firstSale,
              renewalIncome: commission.renewal,
              currentSlab: slab.name,
              nextMilestone,
              dealsClosed: dealsThisMonth,
              daysRemaining,
              payingCustomers: payingCount,
              trialCustomersAtRisk: trialAtRisk,
              hottestLead: topLead?.name ?? null,
            },
            promptContext: [
              "COMMISSION DATA:",
              `- Earned this month: Rs ${commission.total}`,
              `- First sale: Rs ${commission.firstSale}`,
              `- Renewal income: Rs ${commission.renewal}`,
              `- Current slab: ${slab.name}`,
              `- Next milestone: ${nextMilestone ?? "Diamond achieved"}`,
              `- Deals closed: ${dealsThisMonth}`,
              `- Days remaining: ${daysRemaining}`,
              `- Paying customers: ${payingCount}`,
              `- Trial customers at risk: ${trialAtRisk}`,
              `- Hottest lead: ${topLead?.name ?? "No hot lead yet"}`,
            ].join("\n"),
          }),
        },
      ],
    });
    if (text) {
      brief = sanitizeBrief(JSON.parse(text), userName);
    }
  } catch {
    brief = fallbackBrief(userName, dueLeads[0]?.id);
  }

  const safeTasks = await filterBriefTasksForBdm(userId, brief.tasks);

  return prisma.dailyBrief.create({
    data: {
      userId,
      greeting: brief.greeting,
      tasks: safeTasks,
      insights: brief.insights,
    },
  });
}

export default async function BdmPage() {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      defaultPassword: true,
      businessId: true,
      business: { select: { name: true } },
    },
  });

  if (!user?.businessId || !user.business) redirect("/onboarding");

  const month = monthBounds();

  const [
    brief,
    initialMetrics,
    leads,
    callLogs,
    target,
    earnings,
    commissionCount,
    portfolioCount,
    onboardingMemory,
  ] = await Promise.all([
    getOrCreateBrief(user.id, user.name),
    getMetrics(user.id, user.businessId),
    prisma.lead.findMany({
      where: {
        businessId: user.businessId,
        OR: [{ assignedTo: user.id }, { createdBy: user.id }],
      },
      include: {
        assignee: { select: { id: true, name: true, role: true } },
        _count: { select: { activities: true } },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
      orderBy: [{ score: "desc" }],
      take: 20,
    }),
    prisma.callLog.findMany({
      where: { userId: user.id },
      include: { lead: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.target.findUnique({
      where: {
        userId_month_year: {
          userId: user.id,
          month: month.month,
          year: month.year,
        },
      },
    }),
    calcMonthlyEarnings(user.id, month.month, month.year),
    prisma.commission.count({ where: { userId: user.id } }),
    prisma.customerPortfolio.count({ where: { userId: user.id } }),
    prisma.nexaMemory.findUnique({
      where: {
        businessId_key: {
          businessId: user.businessId,
          key: `bde_onboarding_complete:${user.id}`,
        },
      },
    }),
  ]);

  const tasks = sanitizeBrief(
    { greeting: brief.greeting, tasks: brief.tasks, insights: brief.insights },
    user.name,
  );
  const safeTasks = await filterBriefTasksForBdm(user.id, tasks.tasks);

  return (
    <BdmDashboard
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        defaultPassword: user.defaultPassword,
        businessId: user.businessId,
        businessName: user.business.name,
      }}
      initialBrief={{
        ...tasks,
        tasks: safeTasks,
        createdAt: brief.createdAt.toISOString(),
      }}
      initialMetrics={initialMetrics}
      initialLeads={leads.map((lead) => ({
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        company: lead.company,
        source: lead.source,
        status: lead.status,
        score: lead.score,
        scoreReason: lead.scoreReason,
        value: lead.value,
        notes: lead.notes,
        assignedTo: lead.assignedTo,
        assignee: lead.assignee,
        createdAt: lead.createdAt.toISOString(),
        updatedAt: lead.updatedAt.toISOString(),
        followUpDate: lead.followUpDate?.toISOString() ?? null,
        lastActivityDate: lead.activities[0]?.createdAt.toISOString() ?? null,
        activitiesCount: lead._count.activities,
      }))}
      initialCallLogs={callLogs.map((call) => ({
        ...call,
        createdAt: call.createdAt.toISOString(),
      }))}
      initialTarget={{
        leadsTarget: target?.leadsTarget ?? 0,
        wonTarget: target?.wonTarget ?? 0,
        revenueTarget: target?.revenueTarget ?? 0,
      }}
      initialCommission={{
        total: earnings.total,
        target: 30000,
        progressPct: (earnings.total / 30000) * 100,
      }}
      showBdeOnboarding={
        !onboardingMemory && commissionCount === 0 && portfolioCount === 0
      }
    />
  );
}
