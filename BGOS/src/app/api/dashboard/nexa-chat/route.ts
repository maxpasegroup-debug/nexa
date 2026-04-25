import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

import { getCurrentBusiness } from "@/lib/dashboard/server";
import { buildNexaSystemPrompt } from "@/lib/nexa-context";
import { prisma } from "@/lib/prisma";

function detectRequestedAction(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("send a reminder") ||
    normalized.includes("set reminder") ||
    normalized.includes("remind ")
  ) {
    return {
      type: "set_reminder",
      description: message,
    };
  }

  if (
    normalized.includes("reassign") ||
    normalized.includes("assign this lead") ||
    normalized.includes("assign lead")
  ) {
    return {
      type: "reassign_lead",
      description: message,
    };
  }

  if (
    normalized.includes("create a task") ||
    normalized.includes("create task") ||
    normalized.includes("add a task")
  ) {
    return {
      type: "create_task",
      description: message,
    };
  }

  return null;
}

export async function GET() {
  try {
    const context = await getCurrentBusiness();

    if (context.error) return context.error;

    const messages = await prisma.nexaMessage.findMany({
      where: { businessId: context.business.id },
      orderBy: { createdAt: "desc" },
      take: 20,
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

    if (context.error) return context.error;

    const { message } = await request.json();

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 },
      );
    }

    const trimmedMessage = message.trim();
    const requestedAction = detectRequestedAction(trimmedMessage);

    if (requestedAction) {
      const responseText = `Done — I've noted this action. ${requestedAction.description}`;

      await prisma.$transaction([
        prisma.nexaMessage.create({
          data: {
            businessId: context.business.id,
            role: "user",
            content: trimmedMessage,
          },
        }),
        prisma.nexaAction.create({
          data: {
            businessId: context.business.id,
            type: requestedAction.type,
            description: requestedAction.description,
            payload: { source: "chat", message: trimmedMessage },
            status: "requested",
            triggeredBy: context.user.id,
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
    }

    const [messages, systemPrompt] = await Promise.all([
      prisma.nexaMessage.findMany({
        where: { businessId: context.business.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      buildNexaSystemPrompt(
        context.business.id,
        context.user.role,
        context.user.name,
      ),
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
      max_tokens: 600,
      system: systemPrompt,
      messages: [
        ...contextMessages,
        {
          role: "user",
          content: trimmedMessage,
        },
      ],
    });
    const textBlock = response.content.find((block) => block.type === "text");
    const responseText =
      textBlock?.type === "text"
        ? textBlock.text
        : "Focus on your hottest leads today. Start by calling the top scored lead now.";

    await prisma.$transaction([
      prisma.nexaMessage.create({
        data: {
          businessId: context.business.id,
          role: "user",
          content: trimmedMessage,
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
