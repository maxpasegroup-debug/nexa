import { NextResponse } from "next/server";

import { sendEmail } from "@/lib/email";
import {
  createRazorpaySubscription,
  dueInHours,
  escapeHtml,
  findBossForBusiness,
  getString,
  verifyRazorpaySignature,
} from "@/lib/marketplace";
import { findLeastLoadedSDE, getInternalBusiness } from "@/lib/onboarding-flow";
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

    const internalBusiness = await getInternalBusiness();
    if (!internalBusiness) {
      return NextResponse.json(
        { error: "BGOS internal business not found." },
        { status: 503 },
      );
    }

    const sde = await findLeastLoadedSDE(internalBusiness.id);
    if (!sde) {
      return NextResponse.json(
        { error: "No SDE available for assignment." },
        { status: 503 },
      );
    }

    const subscription = await createRazorpaySubscription({
      agent: installation.agent,
      businessName: installation.business.name,
    });

    const description = JSON.stringify(
      {
        business: {
          id: installation.business.id,
          name: installation.business.name,
          type: installation.business.type,
          teamSize: installation.business.teamSize,
          goal: installation.business.goal,
        },
        agent: {
          id: installation.agent.id,
          name: installation.agent.name,
          category: installation.agent.category,
          features: installation.agent.features,
          onboardingFee: installation.agent.onboardingFee,
          monthlyFee: installation.agent.monthlyFee,
        },
        requirements:
          "Configure workspace integrations, validate agent access, and activate within 24 hours.",
      },
      null,
      2,
    );

    const [updated] = await prisma.$transaction([
      prisma.agentInstallation.update({
        where: { id: installation.id },
        data: {
          onboardingFeePaid: true,
          monthlyFeePaid: false,
          status: "PAYMENT_DONE",
          razorpaySetupId: razorpayOrderId,
          razorpayMandateId: subscription.id,
          sdeAssignedId: sde.id,
        },
      }),
      prisma.task.create({
        data: {
          title: `Install ${installation.agent.name} for ${installation.business.name}`,
          priority: "HIGH",
          description,
          dueDate: dueInHours(24),
          assignedTo: sde.id,
        },
      }),
      prisma.nexaInsight.create({
        data: {
          businessId: internalBusiness.id,
          type: "marketplace",
          message: `New agent installation - ${installation.agent.name} for ${installation.business.name}. SDE ${sde.name} assigned.`,
          action: "Track marketplace install",
        },
      }),
    ]);

    const boss = await findBossForBusiness(businessId);
    await Promise.allSettled([
      sendEmail({
        to: sde.email,
        toName: sde.name,
        subject: `Install ${installation.agent.name} for ${installation.business.name}`,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.7">
            <h2>Marketplace installation brief</h2>
            <p><strong>Agent:</strong> ${escapeHtml(installation.agent.name)}</p>
            <p><strong>Business:</strong> ${escapeHtml(installation.business.name)}</p>
            <pre style="white-space:pre-wrap;background:#f4f4f4;padding:16px;border-radius:8px;">${escapeHtml(description)}</pre>
            <p><a href="https://iceconnect.in/sde">Open SDE workspace</a></p>
          </div>
        `,
      }),
      boss
        ? sendEmail({
            to: boss.email,
            toName: boss.name,
            subject: `${installation.agent.name} payment confirmed`,
            html: `<p>Payment confirmed. Our team is setting up <strong>${escapeHtml(installation.agent.name)}</strong> for your business. Active within 24 hours.</p>`,
          })
        : Promise.resolve(false),
    ]);

    return NextResponse.json({
      success: true,
      installationId: updated.id,
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
