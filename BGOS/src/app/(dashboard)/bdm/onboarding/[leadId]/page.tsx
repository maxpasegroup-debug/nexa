import { redirect } from "next/navigation";

import NexaChat from "@/components/bdm/nexa-chat";
import { auth } from "@/lib/auth";
import { generateClientId } from "@/lib/client-id";
import { prisma } from "@/lib/prisma";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

function asMessages(value: unknown): ChatMessage[] {
  return Array.isArray(value)
    ? value.filter(
        (message): message is ChatMessage =>
          message &&
          typeof message === "object" &&
          ((message as ChatMessage).role === "user" || (message as ChatMessage).role === "assistant") &&
          typeof (message as ChatMessage).content === "string",
      )
    : [];
}

export default async function OnboardingPage({ params }: { params: { leadId: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const lead = await prisma.lead.findFirst({
    where: {
      id: params.leadId,
      OR: [{ assignedTo: session.user.id }, { createdBy: session.user.id }],
    },
    include: { onboardingSession: true },
  });
  if (!lead) redirect("/bdm/leads");

  let onboarding = lead.onboardingSession;

  if (!onboarding) {
    onboarding = await prisma.onboardingSession.create({
      data: {
        leadId: params.leadId,
        bdmId: session.user.id,
        clientId: await generateClientId(),
        status: "COLLECTING",
        messages: [],
        companyData: {
          name: lead.company ?? lead.name,
          contactName: lead.name,
          email: lead.email,
          phone: lead.phone,
          description: lead.notes ?? "",
        },
      },
    });

    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        onboardingStarted: true,
        onboardingSessionId: onboarding.id,
        bdmStatus: "ONBOARDING",
      },
    });
  }

  if (onboarding && !onboarding.isComplete) {
    const msgs = Array.isArray(onboarding.messages) ? onboarding.messages : [];
    const firstMessage = msgs[0] as Record<string, unknown> | undefined;
    const hasOldData = msgs.length === 0 || firstMessage?.type !== undefined;

    if (hasOldData) {
      await prisma.onboardingSession.update({
        where: { id: onboarding.id },
        data: { messages: [], status: "COLLECTING" },
      });
      onboarding = { ...onboarding, messages: [] };
    }
  }

  return (
    <NexaChat
      sessionId={onboarding.id}
      initialMessages={asMessages(onboarding.messages)}
      isComplete={onboarding.isComplete}
    />
  );
}
