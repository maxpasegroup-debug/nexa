import { NextResponse } from "next/server";

import {
  getCurrentBusiness,
  getDashboardMetrics,
} from "@/lib/dashboard/server";
import { createChatCompletionText } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

const INSIGHTS_SYSTEM_PROMPT =
  "You are NEXA, the AI CEO. Analyse this business data and return exactly 3 actionable insights as a JSON array. Each insight has: type (string — one of 'warning', 'opportunity', 'action'), message (string — one clear sentence under 20 words), action (string — one specific thing to do right now, under 10 words). Return only the JSON array, no other text.";

type InsightInput = {
  type: "warning" | "opportunity" | "action";
  message: string;
  action: string;
};

function normalizeInsightType(
  value: unknown,
): "warning" | "opportunity" | "action" {
  if (value === "warning" || value === "opportunity" || value === "action") {
    return value;
  }

  return "action";
}

function parseInsights(text: string): InsightInput[] {
  const parsed = JSON.parse(text) as unknown;

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .filter((item): item is Record<string, unknown> => {
      return Boolean(item) && typeof item === "object";
    })
    .map((item) => ({
      type: normalizeInsightType(item.type),
      message:
        typeof item.message === "string"
          ? item.message
          : "Review business performance today.",
      action:
        typeof item.action === "string" ? item.action : "Review dashboard",
    }))
    .slice(0, 3);
}

export async function GET() {
  try {
    const context = await getCurrentBusiness();

    if (context.error) {
      return context.error;
    }

    const insights = await prisma.nexaInsight.findMany({
      where: {
        businessId: context.business.id,
        read: false,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({ insights });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch NEXA insights." },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const context = await getCurrentBusiness();

    if (context.error) {
      return context.error;
    }

    const metrics = await getDashboardMetrics(
      context.business.id,
      context.business.healthScore,
    );
    const text = await createChatCompletionText({
      maxTokens: 500,
      system: INSIGHTS_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            totalLeads: metrics.totalLeads,
            teamCount: metrics.teamCount,
            healthScore: metrics.healthScore,
          }),
        },
      ],
    });
    const insights = text ? parseInsights(text) : [];

    if (insights.length !== 3) {
      return NextResponse.json(
        { error: "NEXA did not return 3 valid insights." },
        { status: 502 },
      );
    }

    const savedInsights = await prisma.$transaction(
      insights.map((insight) =>
        prisma.nexaInsight.create({
          data: {
            businessId: context.business.id,
            type: insight.type,
            message: insight.message,
            action: insight.action,
          },
        }),
      ),
    );

    return NextResponse.json({ insights: savedInsights });
  } catch {
    return NextResponse.json(
      { error: "Unable to generate NEXA insights." },
      { status: 500 },
    );
  }
}
