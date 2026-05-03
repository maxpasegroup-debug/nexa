import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { sendEmail } from "@/lib/email";
import { createRazorpayOrder, escapeHtml, findBossForBusiness, razorpayKeyId } from "@/lib/marketplace";
import { requireSessionUser } from "@/lib/onboarding-session-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function paymentPageUrl(agentSlug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? "https://iceconnect.in";
  return `${baseUrl.replace(/\/$/, "")}/boss/agents/${encodeURIComponent(agentSlug)}`;
}

export async function POST(request: Request) {
  try {
    const { error, user } = await requireSessionUser(["BDM"]);
    if (error) return error;

    const body = (await request.json()) as Record<string, unknown>;
    const businessId = getString(body.businessId);
    const agentSlug = getString(body.agentSlug);
    const sessionId = getString(body.sessionId);

    if (!businessId || !agentSlug || !sessionId) {
      return NextResponse.json(
        { error: "businessId, agentSlug, and sessionId are required." },
        { status: 400 },
      );
    }

    const [business, session, agent] = await Promise.all([
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
        select: { id: true, name: true },
      }),
      prisma.agentOnboardingSession.findFirst({
        where: { id: sessionId, bdmId: user.id, businessId, agentSlug },
        select: { id: true, isComplete: true, collectedData: true },
      }),
      prisma.marketplaceAgent.findUnique({ where: { slug: agentSlug } }),
    ]);

    if (!business) {
      return NextResponse.json({ error: "Customer not found for this BDM." }, { status: 404 });
    }

    if (!session?.isComplete) {
      return NextResponse.json({ error: "Complete the NEXA session before sending payment." }, { status: 400 });
    }

    if (!agent?.isActive) {
      return NextResponse.json({ error: "Agent not found." }, { status: 404 });
    }

    const boss = await findBossForBusiness(businessId);
    if (!boss) {
      return NextResponse.json({ error: "No active BOSS found for this customer." }, { status: 404 });
    }

    const onboardingFee = Math.round(agent.onboardingFee);
    const monthlyFee = Math.round(agent.monthlyFee);
    const gst = Math.round((onboardingFee + monthlyFee) * 0.18);
    const total = onboardingFee + monthlyFee + gst;

    const installation = await prisma.agentInstallation.upsert({
      where: { agentId_businessId: { agentId: agent.id, businessId } },
      create: {
        agentId: agent.id,
        businessId,
        status: "PENDING",
        customConfig: {
          agentSessionId: session.id,
          collectedData: session.collectedData,
        } as Prisma.InputJsonValue,
      },
      update: {
        status: "PENDING",
        cancelReason: null,
        customConfig: {
          agentSessionId: session.id,
          collectedData: session.collectedData,
        } as Prisma.InputJsonValue,
      },
    });

    const order = await createRazorpayOrder({
      amount: total,
      receipt: `agent_${installation.id.slice(0, 24)}`,
      notes: {
        paymentType: "AGENT_ONBOARDING",
        businessId,
        agentSlug,
        onboardingFee: String(onboardingFee),
        monthlyFee: String(monthlyFee),
        sessionId,
      },
    });

    const paymentUrl = paymentPageUrl(agentSlug);
    await prisma.$transaction([
      prisma.agentInstallation.update({
        where: { id: installation.id },
        data: {
          status: "AWAITING_PAYMENT",
          razorpaySetupId: order.id,
        },
      }),
      prisma.agentOnboardingSession.update({
        where: { id: session.id },
        data: { status: "PAYMENT_LINK_SENT" },
      }),
      prisma.nexaInsight.create({
        data: {
          businessId,
          targetUserId: boss.id,
          type: "AGENT_PAYMENT_REQUIRED",
          title: `${agent.name} ready to activate`,
          message: `⚡ ${agent.name} has been configured for your workspace. Pay ₹${total.toLocaleString("en-IN")} to activate it.`,
          content: paymentUrl,
          action: "Pay now →",
          priority: "HIGH",
        },
      }),
    ]);

    await sendEmail({
      to: boss.email,
      toName: boss.name,
      subject: `⚡ ${agent.name} is ready for your workspace`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.7">
          <p>${escapeHtml(user.name)} has set up <strong>${escapeHtml(agent.name)}</strong> for <strong>${escapeHtml(business.name)}</strong>.</p>
          <p>Pay now to activate. Total: <strong>₹${total.toLocaleString("en-IN")}</strong> (₹${onboardingFee.toLocaleString("en-IN")} setup + ₹${monthlyFee.toLocaleString("en-IN")} first month + ₹${gst.toLocaleString("en-IN")} GST).</p>
          <p>After payment our team will integrate it within 24 hours.</p>
          <p><a href="${escapeHtml(paymentUrl)}" style="display:inline-block;background:#F5A623;color:#000;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:bold">Pay now</a></p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      installationId: installation.id,
      paymentUrl,
      order,
      keyId: razorpayKeyId(),
      total,
      breakdown: { onboardingFee, monthlyFee, gst },
    });
  } catch (error) {
    console.error("[marketplace:install:send-payment]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to send payment link." },
      { status: 500 },
    );
  }
}
