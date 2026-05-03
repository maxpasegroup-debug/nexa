import { NextResponse } from "next/server";

import { filterBriefTasksForBdm } from "@/lib/bdm/brief-safety";
import { getBdmContext, monthBounds, todayBounds } from "@/lib/bdm/server";
import {
  calcMonthlyEarnings,
  getCurrentSlab,
  getNextMilestone,
} from "@/lib/commission";
import { createChatCompletionText } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

const BRIEF_SYSTEM_PROMPT =
  "You are NEXA, the AI CEO. Generate a morning brief for this BDM. Always mention customer alerts first when present because revenue at risk is more important than new leads today. Return only a JSON object with these fields: greeting (string — a warm personalised good morning message using their name and one motivational line under 20 words), tasks (array of 5 objects each with: title string, priority 'high'/'medium'/'low', leadId string or null, type 'follow_up'/'new_lead'/'demo'/'proposal'/'admin'), insights (array of 3 strings — each a sharp one-line sales tip for today). No other text.";

const COMMISSION_BRIEF_INSTRUCTION =
  "Use EARNINGS TODAY in the user message. If earnings are greater than 0, mention the amount earned this month. If earnings are 0, do not mention earnings; focus on lead activity and what to do today.";

function parseBrief(text: string) {
  const parsed = JSON.parse(text) as unknown;

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Invalid brief");
  }

  const brief = parsed as Record<string, unknown>;
  return {
    greeting:
      typeof brief.greeting === "string"
        ? brief.greeting
        : "Good morning. Let us win the day with sharp follow-ups.",
    tasks: Array.isArray(brief.tasks) ? brief.tasks : [],
    insights: Array.isArray(brief.insights) ? brief.insights : [],
  };
}

export async function GET() {
  try {
    const context = await getBdmContext();

    if (context.error) return context.error;

    const today = todayBounds();
    const existingBrief = await prisma.dailyBrief.findFirst({
      where: {
        userId: context.user.id,
        date: {
          gte: today.start,
          lt: today.end,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existingBrief) {
      const safeTasks = await filterBriefTasksForBdm(
        context.user.id,
        existingBrief.tasks,
      );

      if (safeTasks.length !== (Array.isArray(existingBrief.tasks) ? existingBrief.tasks.length : 0)) {
        await prisma.dailyBrief.update({
          where: { id: existingBrief.id },
          data: { tasks: safeTasks },
        });
      }

      return NextResponse.json({
        brief: {
          ...existingBrief,
          tasks: safeTasks,
        },
      });
    }

    const now = new Date();
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(now.getDate() - 3);
    const month = monthBounds(now);
    const totalDays = new Date(month.year, month.month, 0).getDate();
    const daysRemaining = Math.max(0, totalDays - now.getDate());

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
      marketplaceLeads,
      atRiskCustomers,
      trialEndingSoon,
      wallet,
    ] = await Promise.all([
      prisma.lead.groupBy({
        by: ["status"],
        where: { assignedTo: context.user.id },
        _count: { _all: true },
      }),
      prisma.lead.findMany({
        where: {
          assignedTo: context.user.id,
          followUpDate: { lte: today.end },
          status: { notIn: ["WON", "LOST"] },
        },
        select: { id: true, name: true, status: true, followUpDate: true, score: true },
        take: 20,
      }),
      prisma.lead.findMany({
        where: {
          assignedTo: context.user.id,
          createdAt: { lte: threeDaysAgo },
          lastContactAt: null,
          status: { notIn: ["WON", "LOST"] },
        },
        select: { id: true, name: true, status: true, createdAt: true, score: true },
        take: 20,
      }),
      prisma.lead.count({
        where: {
          assignedTo: context.user.id,
          status: "WON",
          wonAt: { gte: month.start, lt: month.end },
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
      calcMonthlyEarnings(context.user.id, month.month, month.year),
      getCurrentSlab(context.user.id, month.month, month.year),
      prisma.commission.count({
        where: {
          userId: context.user.id,
          month: month.month,
          year: month.year,
          type: "FIRST_SALE",
          status: { not: "CLAWBACK" },
        },
      }),
      prisma.customerPortfolio.groupBy({
        by: ["status"],
        where: {
          userId: context.user.id,
          status: { in: ["PAYING", "TRIAL"] },
        },
        _count: { _all: true },
      }),
      prisma.customerPortfolio.count({
        where: {
          userId: context.user.id,
          status: "TRIAL",
          trialEndsAt: { lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.lead.findMany({
        where: {
          assignedTo: context.user.id,
          source: "MARKETPLACE",
          createdAt: { gte: today.start, lt: today.end },
          status: { notIn: ["WON", "LOST"] },
        },
        select: { id: true, name: true, company: true, notes: true },
        take: 20,
      }),
      prisma.business.findMany({
        where: {
          status: { in: ["RENEWAL_FAILED", "SUSPENDED"] },
          OR: [
            { commissions: { some: { userId: context.user.id } } },
            { leads: { some: { assignedTo: context.user.id } } },
            { leads: { some: { createdBy: context.user.id } } },
          ],
        },
        select: { name: true, status: true, gracePeriodEndsAt: true },
      }),
      prisma.business.findMany({
        where: {
          status: "TRIAL",
          trialEndsAt: { lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
          OR: [
            { commissions: { some: { userId: context.user.id } } },
            { leads: { some: { assignedTo: context.user.id } } },
            { leads: { some: { createdBy: context.user.id } } },
          ],
        },
        select: { name: true, trialEndsAt: true },
      }),
      prisma.bDMWallet.findUnique({ where: { userId: context.user.id } }),
    ]);
    const customerAlertLines = [
      "CUSTOMER ALERTS:",
      atRiskCustomers.length > 0
        ? `AT RISK: ${atRiskCustomers.map((customer) => `${customer.name} (${customer.status})`).join(", ")}`
        : "No customers at risk",
      trialEndingSoon.length > 0
        ? `TRIAL ENDING: ${trialEndingSoon
            .map((customer) => {
              const days = customer.trialEndsAt
                ? Math.ceil((customer.trialEndsAt.getTime() - Date.now()) / 86_400_000)
                : 0;
              return `${customer.name} in ${days} days`;
            })
            .join(", ")}`
        : "",
    ].filter(Boolean);
    const marketplaceLeadLines = marketplaceLeads.map((lead) => {
      const agentInterest =
        lead.notes?.match(/interested in ([^.]+?)(?:\.|$)/i)?.[1]?.trim() ??
        "a marketplace agent";
      return `- ${lead.company ?? lead.name} wants ${agentInterest} — call within 2 hours`;
    });
    const topLead = [...dueLeads, ...staleLeads].sort((a, b) => b.score - a.score)[0];
    const payingCount =
      portfolioCounts.find((item) => item.status === "PAYING")?._count._all ?? 0;
    const nextMilestone = getNextMilestone(dealsThisMonth);
    const targetValue = target?.revenueTarget || 30000;
    const walletEarnings = wallet?.thisMonthEarned || 0;
    const progressPct = targetValue > 0 ? Math.min(100, Math.round((walletEarnings / targetValue) * 100)) : 0;

    const text = await createChatCompletionText({
      maxTokens: 700,
      system: `${BRIEF_SYSTEM_PROMPT} ${COMMISSION_BRIEF_INSTRUCTION}`,
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            name: context.user.name,
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
              ...customerAlertLines,
              "Mention customer alerts before marketplace leads, follow-ups, or commission context.",
              "EARNINGS TODAY:",
              `This month so far: ₹${walletEarnings}`,
              `Target: ₹${targetValue}`,
              `Progress: ${progressPct}%`,
              `Current slab: ${wallet?.currentSlab || "None"}`,
              walletEarnings > 0
                ? "Earnings are greater than 0, mention the amount earned this month in the brief."
                : "Earnings are 0, do not mention earnings; focus on lead activity and what to do today.",
              "MARKETPLACE LEADS TODAY:",
              marketplaceLeadLines.length > 0 ? marketplaceLeadLines.join("\n") : "- None",
              "Mention marketplace leads first if any exist because they are the hottest leads.",
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
    const brief = text
      ? parseBrief(text)
      : {
          greeting: `Good morning, ${context.user.name}. Focus on your hottest follow-ups today.`,
          tasks: [],
          insights: [],
        };
    const safeTasks = await filterBriefTasksForBdm(context.user.id, brief.tasks);

    const savedBrief = await prisma.dailyBrief.create({
      data: {
        userId: context.user.id,
        tasks: safeTasks,
        insights: brief.insights,
        greeting: brief.greeting,
      },
    });

    return NextResponse.json({ brief: savedBrief });
  } catch {
    return NextResponse.json(
      { error: "Unable to generate BDM brief." },
      { status: 500 },
    );
  }
}
