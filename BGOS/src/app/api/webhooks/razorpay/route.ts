import crypto from "crypto";

import { transitionBusinessStatus } from "@/lib/business-status";
import { notifyRenewalFailed } from "@/lib/churn-notifications";
import { createAgentCommission, createPlanCommission } from "@/lib/commission-engine";
import { prisma } from "@/lib/prisma";
import { sendEmployeeWelcomeEmails } from "@/lib/welcome-emails";

export const dynamic = "force-dynamic";

type RazorpayEntity = {
  id?: string;
  amount?: number;
  customer_id?: string;
  subscription_id?: string;
  notes?: Record<string, string>;
};

type RazorpayWebhookPayload = {
  event?: string;
  payload?: {
    payment?: { entity?: RazorpayEntity };
    subscription?: { entity?: RazorpayEntity };
  };
};

function verifySignature(rawBody: string, signature: string | null) {
  if (!signature || !process.env.RAZORPAY_WEBHOOK_SECRET) return false;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  const received = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}

async function markAgentInstallationPaid({
  businessId,
  agentSlug,
  onboardingFeePaid,
  monthlyFeePaid,
}: {
  businessId: string;
  agentSlug?: string;
  onboardingFeePaid?: boolean;
  monthlyFeePaid?: boolean;
}) {
  if (!agentSlug) return;

  await prisma.agentInstallation.updateMany({
    where: { businessId, agent: { slug: agentSlug } },
    data: {
      ...(onboardingFeePaid === undefined ? {} : { onboardingFeePaid }),
      ...(monthlyFeePaid === undefined ? {} : { monthlyFeePaid }),
      status: "PAYMENT_DONE",
    },
  });
}

async function handleCaptured(payment?: RazorpayEntity) {
  const notes = payment?.notes ?? {};
  const paymentType = notes.paymentType;
  const businessId = notes.businessId;

  if (!businessId) {
    console.error("[razorpay:webhook] Missing businessId in payment notes");
    return;
  }

  if (paymentType === "AGENT_ONBOARDING") {
    await markAgentInstallationPaid({
      businessId,
      agentSlug: notes.agentSlug,
      onboardingFeePaid: true,
    });
    return;
  }

  if (paymentType === "PLAN_SUBSCRIPTION") {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { firstPaymentAt: true },
    });

    await createPlanCommission({
      businessId,
      razorpayPaymentId: payment?.id ?? "",
      isFirstPayment: !business?.firstPaymentAt,
    });
    return;
  }

  if (paymentType === "AGENT_SUBSCRIPTION") {
    const agentSlug = notes.agentSlug;
    if (!agentSlug) return;

    const existingAgentComm = await prisma.commission.findFirst({
      where: { businessId, agentSlug, type: "AGENT_FIRST_SALE" },
      select: { id: true },
    });

    await createAgentCommission({
      businessId,
      agentSlug,
      razorpayPaymentId: payment?.id ?? "",
      isFirstPayment: !existingAgentComm,
    });

    await markAgentInstallationPaid({
      businessId,
      agentSlug,
      monthlyFeePaid: true,
    });
  }
}

async function handleFailed(payment?: RazorpayEntity) {
  const businessId = payment?.notes?.businessId;
  if (!businessId) return;

  await transitionBusinessStatus(businessId, "RENEWAL_FAILED", "Razorpay payment failed");
  await notifyRenewalFailed(businessId);
}

async function handleSubscriptionActivated(subscription?: RazorpayEntity) {
  const businessId = subscription?.notes?.businessId;
  if (!businessId) return;

  await transitionBusinessStatus(businessId, "TRIAL", "Razorpay subscription activated");
  await prisma.user.updateMany({
    where: { businessId },
    data: { active: true },
  });
  await sendEmployeeWelcomeEmails(businessId);
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifySignature(rawBody, signature)) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(rawBody) as RazorpayWebhookPayload;
  const eventType = event.event ?? "unknown";
  const log = await prisma.webhookLog.create({
    data: {
      source: "razorpay",
      event: eventType,
      payload: event as object,
      processed: false,
    },
  });

  try {
    if (eventType === "payment.captured" || eventType === "subscription.charged") {
      await handleCaptured(event.payload?.payment?.entity ?? event.payload?.subscription?.entity);
    }

    if (eventType === "payment.failed") {
      await handleFailed(event.payload?.payment?.entity);
    }

    if (eventType === "subscription.activated") {
      await handleSubscriptionActivated(event.payload?.subscription?.entity);
    }

    await prisma.webhookLog.update({
      where: { id: log.id },
      data: { processed: true },
    });

    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    await prisma.webhookLog.update({
      where: { id: log.id },
      data: { error: error instanceof Error ? error.message : String(error) },
    });

    return new Response("ok", { status: 200 });
  }
}
