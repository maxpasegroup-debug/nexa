import { NextResponse } from "next/server";

import { getBdmContext, monthBounds, todayBounds } from "@/lib/bdm/server";
import { createChatCompletionText } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

const BRIEF_SYSTEM_PROMPT =
  "You are NEXA, the AI CEO. Generate a morning brief for this BDM. Return only a JSON object with these fields: greeting (string — a warm personalised good morning message using their name and one motivational line under 20 words), tasks (array of 5 objects each with: title string, priority 'high'/'medium'/'low', leadId string or null, type 'follow_up'/'new_lead'/'demo'/'proposal'/'admin'), insights (array of 3 strings — each a sharp one-line sales tip for today). No other text.";

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

    const [
      statusCounts,
      dueLeads,
      staleLeads,
      wonThisMonth,
      target,
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
    ]);

    const text = await createChatCompletionText({
      maxTokens: 700,
      system: BRIEF_SYSTEM_PROMPT,
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
