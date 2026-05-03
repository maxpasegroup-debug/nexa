import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { generateAgentNexaResponse } from "@/lib/nexa-agent-session";
import { requireSessionUser } from "@/lib/onboarding-session-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asMessages(value: unknown): ChatMessage[] {
  return Array.isArray(value) ? (value as ChatMessage[]) : [];
}

function asRecord(value: unknown): Record<string, string> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, string>)
    : {};
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { error, user } = await requireSessionUser(["BDM"]);
    if (error) return error;

    const body = (await request.json()) as Record<string, unknown>;
    const message = getString(body.message);
    if (!message) {
      return NextResponse.json({ error: "message is required." }, { status: 400 });
    }

    const session = await prisma.agentOnboardingSession.findFirst({
      where: { id: params.id, bdmId: user.id },
    });

    if (!session) {
      return NextResponse.json({ error: "Agent session not found." }, { status: 404 });
    }

    if (session.isComplete) {
      return NextResponse.json({
        response: "This integration session is already complete. You can send the payment link now.",
        isComplete: true,
        readyForPayment: true,
        questionIndex: session.questionIndex,
        collectedData: session.collectedData,
      });
    }

    const result = await generateAgentNexaResponse(
      session.agentSlug,
      session.collectedData,
      message,
      session.questionIndex,
    );
    const collectedData = {
      ...asRecord(session.collectedData),
      ...result.extractedData,
    };
    const now = new Date().toISOString();
    const messages = [
      ...asMessages(session.messages),
      { role: "user", content: message, createdAt: now },
      { role: "assistant", content: result.response, createdAt: now },
    ] satisfies ChatMessage[];

    await prisma.agentOnboardingSession.update({
      where: { id: session.id },
      data: {
        messages: messages as unknown as Prisma.InputJsonValue,
        collectedData: collectedData as Prisma.InputJsonValue,
        questionIndex: result.nextQuestionIndex,
        isComplete: result.isComplete,
        status: result.isComplete ? "READY_FOR_PAYMENT" : "IN_PROGRESS",
      },
    });

    return NextResponse.json({
      response: result.response,
      questionIndex: result.nextQuestionIndex,
      collectedData,
      isComplete: result.isComplete,
      readyForPayment: result.isComplete,
    });
  } catch (error) {
    console.error("[agent-session:chat]", error);
    return NextResponse.json({ error: "Unable to continue agent session." }, { status: 500 });
  }
}
