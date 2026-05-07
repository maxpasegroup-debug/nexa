import { redirect } from "next/navigation";

import NexaChat from "@/components/bdm/nexa-chat";
import { generateClientId } from "@/lib/client-id";
import { requireInternalOwner } from "@/lib/internal-owner";
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

export default async function InternalBossOnboardingPage({ params }: { params: { leadId: string } }) {
  const { owner, business } = await requireInternalOwner();

  const lead = await prisma.lead.findFirst({
    where: { id: params.leadId, businessId: business.id },
    include: { onboardingSession: true, callNotes: { orderBy: { createdAt: "desc" } } },
  });

  if (!lead) redirect("/internal/leads");

  let onboarding = lead.onboardingSession;

  if (!onboarding) {
    const callNoteText = lead.callNotes.map((note) => note.content).join("\n\n");
    onboarding = await prisma.onboardingSession.create({
      data: {
        leadId: lead.id,
        bdmId: lead.assignedTo,
        clientId: await generateClientId(),
        status: "COLLECTING",
        messages: [],
        companyData: {
          name: lead.company ?? lead.name,
          contactName: lead.name,
          email: lead.email,
          phone: lead.phone,
          description: callNoteText || lead.notes || "",
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

  await prisma.activityLog.create({
    data: {
      businessId: business.id,
      userId: owner.id,
      action: "Boss opened NEXA onboarding chat",
      entity: "OnboardingSession",
      entityId: onboarding.id,
      meta: { leadId: lead.id, leadName: lead.name },
    },
  });

  return (
    <NexaChat
      sessionId={onboarding.id}
      initialMessages={asMessages(onboarding.messages)}
      isComplete={onboarding.isComplete}
    />
  );
}
