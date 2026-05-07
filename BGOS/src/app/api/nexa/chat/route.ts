import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { nexaChat } from "@/lib/nexa-chat";
import { prisma } from "@/lib/prisma";

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

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId, message } = (await req.json()) as { sessionId?: string; message?: string };
  if (!sessionId || !message?.trim()) {
    return NextResponse.json({ error: "sessionId and message are required" }, { status: 400 });
  }

  const onboarding = await prisma.onboardingSession.findUnique({ where: { id: sessionId } });
  if (!onboarding) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const messages = asMessages(onboarding.messages);
  const nexaResponse = await nexaChat(
    messages.map(({ role, content }) => ({ role, content })),
    message,
  );

  const now = new Date().toISOString();
  const updatedMessages: StoredMessage[] = [
    ...messages,
    { role: "user", content: message, timestamp: now },
    { role: "assistant", content: nexaResponse, timestamp: now },
  ];

  await prisma.onboardingSession.update({
    where: { id: sessionId },
    data: { messages: updatedMessages as Prisma.InputJsonValue },
  });

  return NextResponse.json({ response: nexaResponse, messages: updatedMessages });
}
