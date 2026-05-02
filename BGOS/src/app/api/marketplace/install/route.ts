import { NextResponse } from "next/server";

import {
  createRazorpayOrder,
  getString,
  requireBusinessAccess,
} from "@/lib/marketplace";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const agentId = getString(body.agentId);
    const businessId = getString(body.businessId);

    if (!agentId || !businessId) {
      return NextResponse.json(
        { error: "agentId and businessId are required." },
        { status: 400 },
      );
    }

    const access = await requireBusinessAccess(businessId, ["BOSS", "OWNER"]);
    if ("error" in access) return access.error;

    const [agent, business, existing] = await Promise.all([
      prisma.marketplaceAgent.findFirst({ where: { id: agentId, isActive: true } }),
      prisma.business.findUnique({ where: { id: businessId } }),
      prisma.agentInstallation.findUnique({
        where: { agentId_businessId: { agentId, businessId } },
      }),
    ]);

    if (!agent) {
      return NextResponse.json({ error: "Agent not found." }, { status: 404 });
    }

    if (!business) {
      return NextResponse.json({ error: "Business not found." }, { status: 404 });
    }

    if (existing && existing.status !== "FAILED") {
      return NextResponse.json(
        { error: "Agent is already installed for this business." },
        { status: 400 },
      );
    }

    const installation = existing
      ? await prisma.agentInstallation.update({
          where: { id: existing.id },
          data: {
            status: "PENDING",
            cancelReason: null,
          },
        })
      : await prisma.agentInstallation.create({
          data: {
            agentId,
            businessId,
            status: "PENDING",
          },
        });

    const order = await createRazorpayOrder({
      amount: agent.onboardingFee,
      receipt: `agent_${installation.id.slice(0, 24)}`,
      notes: {
        agentId,
        businessId,
        installationId: installation.id,
      },
    });

    await prisma.agentInstallation.update({
      where: { id: installation.id },
      data: { razorpaySetupId: order.id },
    });

    return NextResponse.json(
      {
        installation,
        order,
        keyId: process.env.RAZORPAY_KEY_ID ?? null,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[marketplace:install]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to start installation." },
      { status: 500 },
    );
  }
}
