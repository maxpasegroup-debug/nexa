import { redirect } from "next/navigation";

import { AgentOnboardingSession } from "@/components/bdm/agent-onboarding-session";
import { AGENT_QUESTIONS } from "@/lib/nexa-agent-session";
import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function asMessages(value: unknown) {
  return Array.isArray(value)
    ? value.filter(
        (message): message is { role: "user" | "assistant"; content: string; createdAt?: string } =>
          Boolean(message) &&
          typeof message === "object" &&
          "role" in message &&
          "content" in message &&
          (message.role === "user" || message.role === "assistant") &&
          typeof message.content === "string",
      )
    : [];
}

export default async function BdmAgentOnboardingPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "BDM") redirect("/login");

  const agentSession = await prisma.agentOnboardingSession.findFirst({
    where: { id: params.sessionId, bdmId: user.id },
    include: {
      business: {
        include: {
          users: {
            where: { role: { in: ["BOSS", "OWNER"] }, active: true },
            orderBy: { createdAt: "asc" },
            select: { name: true },
          },
        },
      },
    },
  });

  if (!agentSession) redirect("/bdm/leads");

  const agent = await prisma.marketplaceAgent.findFirst({
    where: { slug: agentSession.agentSlug, isActive: true },
    select: {
      name: true,
      icon: true,
      colorPrimary: true,
      colorSecondary: true,
      onboardingFee: true,
      monthlyFee: true,
    },
  });

  if (!agent) redirect("/bdm/leads");

  return (
    <AgentOnboardingSession
      session={{
        id: agentSession.id,
        agentSlug: agentSession.agentSlug,
        questionIndex: agentSession.questionIndex,
        isComplete: agentSession.isComplete,
        messages: asMessages(agentSession.messages),
        business: { id: agentSession.business.id, name: agentSession.business.name },
        agent,
        bossName: agentSession.business.users[0]?.name ?? "the customer",
        questionCount: AGENT_QUESTIONS[agentSession.agentSlug]?.length ?? 1,
      }}
    />
  );
}
