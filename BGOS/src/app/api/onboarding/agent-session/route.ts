import { NextResponse } from "next/server";

import { firstAgentQuestion } from "@/lib/nexa-agent-session";
import { requireSessionUser } from "@/lib/onboarding-session-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const { error, user } = await requireSessionUser(["BDM"]);
    if (error) return error;

    const body = (await request.json()) as Record<string, unknown>;
    const businessId = getString(body.businessId);
    const agentSlug = getString(body.agentSlug);

    if (!businessId || !agentSlug) {
      return NextResponse.json({ error: "businessId and agentSlug are required." }, { status: 400 });
    }

    const [business, agent] = await Promise.all([
      prisma.business.findFirst({
        where: {
          id: businessId,
          status: { in: ["TRIAL", "ACTIVE"] },
          OR: [
            { commissions: { some: { userId: user.id } } },
            { leads: { some: { assignedTo: user.id } } },
            { leads: { some: { createdBy: user.id } } },
          ],
        },
        select: { id: true },
      }),
      prisma.marketplaceAgent.findFirst({
        where: { slug: agentSlug, isActive: true },
        select: { slug: true },
      }),
    ]);

    if (!business) {
      return NextResponse.json({ error: "Customer not found for this BDM." }, { status: 404 });
    }

    if (!agent) {
      return NextResponse.json({ error: "Agent not found." }, { status: 404 });
    }

    const firstQuestion = firstAgentQuestion(agentSlug);
    const session = await prisma.agentOnboardingSession.create({
      data: {
        businessId,
        bdmId: user.id,
        agentSlug,
        messages: [{ role: "assistant", content: firstQuestion, createdAt: new Date().toISOString() }],
      },
      select: { id: true },
    });

    return NextResponse.json(
      { sessionId: session.id, firstQuestion, questionIndex: 0 },
      { status: 201 },
    );
  } catch (error) {
    console.error("[agent-session:create]", error);
    return NextResponse.json({ error: "Unable to create agent session." }, { status: 500 });
  }
}
