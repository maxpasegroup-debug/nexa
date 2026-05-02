import type { BusinessStatus, CommissionType } from "@prisma/client";
import { NextResponse } from "next/server";

import { notifyRenewalFailed } from "@/lib/churn-notifications";
import {
  calcRenewal,
  calculateFirstSaleCommission,
} from "@/lib/commission";
import { sendEmployeeWelcomeEmails } from "@/lib/welcome-emails";
import { prisma } from "@/lib/prisma";
import { verifyRazorpayWebhookSignature } from "@/lib/marketplace";
import { transitionBusinessStatus } from "@/lib/business-status";

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

function getWebhookSignature(request: Request) {
  return (
    request.headers.get("x-razorpay-signature") ??
    request.headers.get("X-Razorpay-Signature") ??
    ""
  );
}

function addDays(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function findBusiness(entity?: RazorpayEntity) {
  const businessId = entity?.notes?.businessId;
  if (businessId) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        trialSubscription: true,
        onboardingLead: { include: { assignedBDM: true } },
        users: true,
      },
    });
    if (business) return business;
  }

  return prisma.business.findFirst({
    where: {
      OR: [
        { razorpayCustomerId: entity?.customer_id ?? "__none__" },
        { razorpaySubscriptionId: entity?.subscription_id ?? entity?.id ?? "__none__" },
        { razorpayMandateId: entity?.subscription_id ?? entity?.id ?? "__none__" },
        { trialSubscription: { razorpayCustomerId: entity?.customer_id ?? "__none__" } },
        { trialSubscription: { razorpayMandateId: entity?.subscription_id ?? entity?.id ?? "__none__" } },
      ],
    },
    include: {
      trialSubscription: true,
      onboardingLead: { include: { assignedBDM: true } },
      users: true,
    },
  });
}

async function createCommissionForPayment({
  businessId,
  bdmId,
  plan,
  amount,
  type,
}: {
  businessId: string;
  bdmId?: string | null;
  plan: string;
  amount: number;
  type: CommissionType;
}) {
  if (!bdmId) return;
  const now = new Date();
  const firstSale = calculateFirstSaleCommission(plan, {
    commissionMultiplier: type === "FIRST_SALE" ? 1 : undefined,
  });
  const baseCommission = type === "FIRST_SALE" ? firstSale.base : calcRenewal(plan);
  const multiplier = type === "FIRST_SALE" ? firstSale.multiplier : 1;
  const commissionAmt = type === "FIRST_SALE" ? firstSale.final : calcRenewal(plan);
  await prisma.commission.create({
    data: {
      userId: bdmId,
      businessId,
      type,
      planType: plan,
      dealValue: amount,
      baseCommission,
      multiplier,
      commissionAmt,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      status: "PENDING",
    },
  });
}

async function handleCaptured(entity?: RazorpayEntity) {
  const business = await findBusiness(entity);
  if (!business) return;

  const amount = (entity?.amount ?? business.trialSubscription?.monthlyAmount ?? 0) / (entity?.amount ? 100 : 1);
  const plan = business.trialSubscription?.plan ?? "STARTER";
  const wasFirstPayment = !business.firstPaymentAt;
  const nextBillingDate = addDays(30);

  if (business.status === "TRIAL" || business.status === "RENEWAL_FAILED") {
    await transitionBusinessStatus(business.id, "ACTIVE", "Razorpay payment captured");
  }

  await prisma.business.update({
    where: { id: business.id },
    data: {
      lastPaymentAt: new Date(),
      firstPaymentAt: business.firstPaymentAt ?? new Date(),
      nextBillingDate,
      razorpayCustomerId: entity?.customer_id ?? business.razorpayCustomerId,
      razorpaySubscriptionId:
        entity?.subscription_id ?? business.razorpaySubscriptionId,
    },
  });

  await prisma.trialSubscription.updateMany({
    where: { businessId: business.id },
    data: { status: "ACTIVE", chargedAt: new Date(), trialEndsAt: new Date() },
  });

  await createCommissionForPayment({
    businessId: business.id,
    bdmId: business.onboardingLead?.assignedBDMId,
    plan,
    amount,
    type: wasFirstPayment ? "FIRST_SALE" : "RENEWAL",
  });

  await prisma.nexaInsight.create({
    data: {
      businessId: business.id,
      type: "PAYMENT_RECEIVED",
      message: `Payment of Rs ${Math.round(amount).toLocaleString("en-IN")} received. Your BGOS subscription is active.`,
      action: "View billing",
    },
  });
}

async function handleFailed(entity?: RazorpayEntity) {
  const business = await findBusiness(entity);
  if (!business || business.status !== "ACTIVE") return;

  const amount = (entity?.amount ?? business.trialSubscription?.monthlyAmount ?? 0) / (entity?.amount ? 100 : 1);
  await transitionBusinessStatus(business.id, "RENEWAL_FAILED", "Razorpay payment failed");
  await prisma.trialSubscription.updateMany({
    where: { businessId: business.id },
    data: { status: "FAILED" },
  });
  await prisma.nexaInsight.create({
    data: {
      businessId: business.id,
      type: "PAYMENT_FAILED",
      message: `Your payment of Rs ${Math.round(amount).toLocaleString("en-IN")} failed. Please contact your account manager within 3 days to avoid service interruption.`,
      action: "Update payment",
    },
  });
  await notifyRenewalFailed(business.id);
}

async function handleSubscriptionActivated(entity?: RazorpayEntity) {
  const business = await findBusiness(entity);
  if (!business) return;

  const trialStartedAt = new Date();
  const trialEndsAt = addDays(7);
  await transitionBusinessStatus(business.id, "TRIAL", "Razorpay subscription activated");
  await prisma.business.update({
    where: { id: business.id },
    data: {
      trialStartedAt,
      trialEndsAt,
      razorpayCustomerId: entity?.customer_id ?? business.razorpayCustomerId,
      razorpaySubscriptionId: entity?.id ?? business.razorpaySubscriptionId,
      razorpayMandateId: entity?.id ?? business.razorpayMandateId,
    },
  });
  await prisma.user.updateMany({ where: { businessId: business.id }, data: { active: true } });
  await sendEmployeeWelcomeEmails(business.id);
  await prisma.nexaInsight.create({
    data: {
      businessId: business.id,
      type: "TRIAL_ACTIVE",
      message: "Your BGOS workspace is now active. Welcome aboard.",
      action: "Open workspace",
    },
  });
}

async function handleSubscriptionCancelled(entity?: RazorpayEntity) {
  const business = await findBusiness(entity);
  if (!business) return;

  const nextStatus: BusinessStatus =
    business.status === "TRIAL" ? "SUSPENDED" : "RENEWAL_FAILED";
  await transitionBusinessStatus(
    business.id,
    nextStatus,
    "Razorpay subscription cancelled",
  );
  await prisma.trialSubscription.updateMany({
    where: { businessId: business.id },
    data: { status: "CANCELLED", cancelledAt: new Date(), cancelReason: "Razorpay subscription cancelled" },
  });
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = getWebhookSignature(request);

  if (!signature || !verifyRazorpayWebhookSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  const payload = JSON.parse(body) as RazorpayWebhookPayload;
  const log = await prisma.webhookLog.create({
    data: {
      source: "razorpay",
      event: payload.event ?? "unknown",
      payload: payload as object,
    },
  });

  try {
    if (payload.event === "payment.captured") {
      await handleCaptured(payload.payload?.payment?.entity);
    }
    if (payload.event === "payment.failed") {
      await handleFailed(payload.payload?.payment?.entity);
    }
    if (payload.event === "subscription.charged") {
      await handleCaptured(payload.payload?.payment?.entity ?? payload.payload?.subscription?.entity);
    }
    if (payload.event === "subscription.activated") {
      await handleSubscriptionActivated(payload.payload?.subscription?.entity);
    }
    if (payload.event === "subscription.cancelled") {
      await handleSubscriptionCancelled(payload.payload?.subscription?.entity);
    }

    await prisma.webhookLog.update({
      where: { id: log.id },
      data: { processed: true },
    });
  } catch (error) {
    console.error("[razorpay:webhook]", error);
    await prisma.webhookLog.update({
      where: { id: log.id },
      data: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }

  return NextResponse.json({ received: true });
}
