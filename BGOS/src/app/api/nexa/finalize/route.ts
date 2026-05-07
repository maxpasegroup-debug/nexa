import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { generateSummary } from "@/lib/nexa-chat";
import { prisma } from "@/lib/prisma";

type StoredMessage = {
  role: string;
  content: string;
};

function asMessages(value: unknown): StoredMessage[] {
  return Array.isArray(value)
    ? value.filter(
        (message): message is StoredMessage =>
          message &&
          typeof message === "object" &&
          typeof (message as StoredMessage).role === "string" &&
          typeof (message as StoredMessage).content === "string",
      )
    : [];
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = (await req.json()) as { sessionId?: string };
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  const onboarding = await prisma.onboardingSession.findUnique({ where: { id: sessionId } });
  if (!onboarding) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const messages = asMessages(onboarding.messages);
  if (messages.length < 4) {
    return NextResponse.json({ error: "Not enough information collected yet" }, { status: 400 });
  }

  const { text, json } = await generateSummary(messages, onboarding.clientId || "");

  const sde = await prisma.user.findFirst({
    where: { role: "SDE", isActive: true },
    orderBy: { sdeOnboardingSessions: { _count: "asc" } },
  });

  await prisma.onboardingSession.update({
    where: { id: sessionId },
    data: {
      summaryText: text,
      summaryJson: json as Prisma.InputJsonObject,
      generatedSummary: text,
      generatedJson: json as Prisma.InputJsonObject,
      summaryGenerated: true,
      summaryGeneratedAt: new Date(),
      status: "SUBMITTED",
      isComplete: true,
      completedAt: new Date(),
      submittedAt: new Date(),
      sdeId: sde?.id,
    },
  });

  if (onboarding.leadId) {
    await prisma.lead.update({
      where: { id: onboarding.leadId },
      data: { bdmStatus: "ONBOARDING" },
    });
  }

  if (sde) {
    await prisma.nexaInsight.create({
      data: {
        businessId: process.env.BGOS_INTERNAL_BUSINESS_ID || sde.businessId || onboarding.leadId || "internal",
        type: "NEW_BUILD_REQUEST",
        title: `New build request - ${String(json.companyName || "New client")}`,
        content: `Onboarding submitted by ${session.user.name || "BDM"}. Summary ready in /sde/workspaces.`,
        message: `New build request - ${String(json.companyName || "New client")}`,
        targetUserId: sde.id,
        priority: "HIGH",
      },
    });
  }

  return NextResponse.json({ success: true, summary: text });
}
