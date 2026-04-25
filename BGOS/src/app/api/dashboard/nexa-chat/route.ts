import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

import {
  getCurrentBusiness,
  getDashboardMetrics,
} from "@/lib/dashboard/server";
import { prisma } from "@/lib/prisma";

const CHAT_SYSTEM_PROMPT =
  "You are NEXA, the AI CEO of this business. You have access to their live data. Answer questions about their business, suggest actions, and give sharp advice. Be direct, confident, and brief — like a senior consultant. Never say you cannot access data. Use the metrics provided as context.";

export async function GET() {
  try {
    const context = await getCurrentBusiness();

    if (context.error) {
      return context.error;
    }

    const messages = await prisma.nexaMessage.findMany({
      where: { businessId: context.business.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({ messages: messages.reverse() });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch NEXA chat history." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const context = await getCurrentBusiness();

    if (context.error) {
      return context.error;
    }

    const { message } = await request.json();

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 },
      );
    }

    const [messages, metrics] = await Promise.all([
      prisma.nexaMessage.findMany({
        where: { businessId: context.business.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      getDashboardMetrics(context.business.id, context.business.healthScore),
    ]);
    const contextMessages = messages.reverse().map((item) => ({
      role: item.role === "user" ? ("user" as const) : ("assistant" as const),
      content: item.content,
    }));
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: CHAT_SYSTEM_PROMPT,
      messages: [
        ...contextMessages,
        {
          role: "user",
          content: `Metrics: ${JSON.stringify(metrics)}\n\nQuestion: ${message}`,
        },
      ],
    });
    const textBlock = response.content.find((block) => block.type === "text");
    const responseText =
      textBlock?.type === "text"
        ? textBlock.text
        : "Focus on your hottest leads and follow up today.";

    await prisma.$transaction([
      prisma.nexaMessage.create({
        data: {
          businessId: context.business.id,
          role: "user",
          content: message,
        },
      }),
      prisma.nexaMessage.create({
        data: {
          businessId: context.business.id,
          role: "nexa",
          content: responseText,
        },
      }),
    ]);

    return NextResponse.json({ response: responseText });
  } catch {
    return NextResponse.json(
      { error: "Unable to chat with NEXA." },
      { status: 500 },
    );
  }
}
