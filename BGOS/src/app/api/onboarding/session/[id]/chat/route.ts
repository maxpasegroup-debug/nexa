import type { Prisma } from "@prisma/client";

import { nexaChat } from "@/lib/nexa-chat";
import { jsonError, requireSessionUser } from "@/lib/onboarding-session-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type StoredMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
};

function asMessages(value: unknown): StoredMessage[] {
  return Array.isArray(value)
    ? value.filter(
        (message): message is StoredMessage =>
          message &&
          typeof message === "object" &&
          ((message as StoredMessage).role === "user" || (message as StoredMessage).role === "assistant") &&
          typeof (message as StoredMessage).content === "string",
      )
    : [];
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { error, user } = await requireSessionUser(["BDM", "BOSS", "OWNER"]);
    if (error) return error;

    const body = (await request.json()) as Record<string, unknown>;
    const message = getString(body.message);
    if (!message) return jsonError("message is required.");

    const session = await prisma.onboardingSession.findFirst({
      where: {
        id: params.id,
        ...(user.role === "BDM" ? { bdmId: user.id } : {}),
      },
    });
    if (!session) return jsonError("Session not found.", 404);

    const messages = asMessages(session.messages);
    const response = await nexaChat(
      messages.map(({ role, content }) => ({ role, content })),
      message,
    );
    const now = new Date().toISOString();
    const updatedMessages: StoredMessage[] = [
      ...messages,
      { role: "user", content: message, timestamp: now },
      { role: "assistant", content: response, timestamp: now },
    ];

    const updated = await prisma.onboardingSession.update({
      where: { id: session.id },
      data: { messages: updatedMessages as Prisma.InputJsonValue },
    });

    return Response.json({
      message: response,
      messages: updatedMessages,
      canSubmit: response.toLowerCase().includes("ready to submit"),
      session: updated,
    });
  } catch (error) {
    console.error("[onboarding-session:chat]", error);
    return jsonError("Unable to process NEXA message.", 500);
  }
}
