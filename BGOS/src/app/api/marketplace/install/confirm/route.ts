import { NextResponse } from "next/server";

import {
  createRazorpaySubscription,
  getString,
  requireBusinessAccess,
  verifyRazorpaySignature,
} from "@/lib/marketplace";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const agentId = getString(body.agentId);
    const businessId = getString(body.businessId);
    const razorpayPaymentId = getString(body.razorpayPaymentId);
    const razorpayOrderId = getString(body.razorpayOrderId);
    const razorpaySignature = getString(body.razorpaySignature);

    if (
      !agentId ||
      !businessId ||
      !razorpayPaymentId ||
      !razorpayOrderId ||
      !razorpaySignature
    ) {
      return NextResponse.json(
        { error: "Payment confirmation details are required." },
        { status: 400 },
      );
    }

    const access = await requireBusinessAccess(businessId, ["BOSS", "OWNER"]);
    if ("error" in access) return access.error;

    if (
      !verifyRazorpaySignature({
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
      })
    ) {
      return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 });
    }

    const installation = await prisma.agentInstallation.findUnique({
      where: { agentId_businessId: { agentId, businessId } },
      include: {
        agent: true,
        business: true,
      },
    });

    if (!installation) {
      return NextResponse.json({ error: "Installation not found." }, { status: 404 });
    }

    const subscription = await createRazorpaySubscription({
      agent: installation.agent,
      businessName: installation.business.name,
    });

    await prisma.agentInstallation.update({
      where: { id: installation.id },
      data: {
        status: "PENDING",
        razorpaySetupId: razorpayOrderId,
        razorpayMandateId: subscription.id,
      },
    });

    return NextResponse.json({
      success: true,
      installationId: installation.id,
      paymentStatus: "PENDING_WEBHOOK",
      subscription,
    });
  } catch (error) {
    console.error("[marketplace:install:confirm]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to confirm installation." },
      { status: 500 },
    );
  }
}
