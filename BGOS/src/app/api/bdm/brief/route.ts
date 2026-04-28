import { NextResponse } from "next/server";

import { getBdmContext, monthBounds, todayBounds } from "@/lib/bdm/server";
import {
  calcMonthlyEarnings,
  getCurrentSlab,
  getNextMilestone,
} from "@/lib/commission";
import { createChatCompletionText } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

const BRIEF_SYSTEM_PROMPT =
  "You are NEXA, the AI CEO. Generate a morning brief for this BDM. Return only a JSON object with these fields: greeting (string — a warm personalised good morning message using their name and one motivational line under 20 words), tasks (array of 5 objects each with: title string, priority 'high'/'medium'/'low', leadId string or null, type 'follow_up'/'new_lead'/'demo'/'proposal'/'admin'), insights (array of 3 strings — each a sharp one-line sales tip for today). No other text.";

const COMMISSION_BRIEF_INSTRUCTION =
  "Use COMMISSION DATA in the user message. The greeting must say: Good morning [name]. You have earned Rs [total] this month with [X] days left. [nextMilestone]. Your hottest lead is [topLead name] - call them first.";

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
      return NextResponse.json({ brief: existingBrief });
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
    ]);
    const topLead = [...dueLeads, ...staleLeads].sort((a, b) => b.score - a.score)[0];
    const payingCount =
      portfolioCounts.find((item) => item.status === "PAYING")?._count._all ?? 0;
    const nextMilestone = getNextMilestone(dealsThisMonth);

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

    const savedBrief = await prisma.dailyBrief.create({
      data: {
        userId: context.user.id,
        tasks: brief.tasks,
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
