import { NextResponse } from "next/server";

import { createRazorpaySubscription } from "@/lib/marketplace";
import { requireSessionUser } from "@/lib/onboarding-session-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { error, user } = await requireSessionUser(["SDE"]);
    if (error) return error;

    const installation = await prisma.agentInstallation.findFirst({
      where: { id: params.id, sdeAssignedId: user.id, status: "SDE_BUILDING" },
      include: { agent: true, business: true },
    });

    if (!installation) {
      return NextResponse.json({ error: "Integration job not found." }, { status: 404 });
    }

    const subscription = await createRazorpaySubscription({
      agent: installation.agent,
      businessName: installation.business.name,
    });

    await prisma.$transaction([
      prisma.agentInstallation.update({
        where: { id: installation.id },
        data: {
          status: "ACTIVE",
          installedAt: new Date(),
          activeFrom: new Date(),
          sdeCompletedAt: new Date(),
          razorpayMandateId: subscription.id,
        },
      }),
      prisma.nexaInsight.create({
        data: {
          businessId: installation.businessId,
          type: "AGENT_ACTIVE",
          title: `${installation.agent.name} is active`,
          message: `${installation.agent.name} is now active in your workspace.`,
          content: `${installation.agent.name} is now active in your workspace.`,
          priority: "HIGH",
        },
      }),
    ]);

    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    console.error("[sde:agent-integration:complete]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to complete integration." },
      { status: 500 },
    );
  }
}
