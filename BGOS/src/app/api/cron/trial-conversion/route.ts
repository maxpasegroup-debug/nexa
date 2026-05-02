import { NextRequest, NextResponse } from "next/server";

import { calculateFirstSaleCommission } from "@/lib/commission";
import { verifyCronSecret } from "@/lib/cron-guard";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

async function attemptMandateCharge({
  mandateId,
  amount,
}: {
  mandateId: string | null;
  amount: number;
}) {
  if (!mandateId) return { ok: false, message: "No Razorpay mandate stored." };

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.warn("[trial-conversion] Razorpay credentials not set. Marking sandbox mandate as charged.");
    return { ok: true, message: "Sandbox mandate accepted." };
  }

  // The real capture must be backed by the Razorpay subscription/mandate created in Checkout.
  // This records the conversion only after a stored mandate is present; payment provider errors fail the conversion.
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/payments/create/recurring", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100),
      currency: "INR",
      recurring: "1",
      token: mandateId,
      description: "BGOS subscription after free trial",
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    return { ok: false, message: JSON.stringify(data) };
  }

  return { ok: true, message: "Charged via Razorpay." };
}

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const reminderStart = addDays(now, 2);
    reminderStart.setHours(0, 0, 0, 0);
    const reminderEnd = addDays(reminderStart, 1);

    const [dueTrials, reminderTrials] = await Promise.all([
      prisma.trialSubscription.findMany({
        where: {
          status: "TRIAL",
          trialEndsAt: { lt: now },
          autoPayEnabled: true,
          cancelledAt: null,
        },
        include: {
          business: {
            include: {
              users: true,
              onboardingLead: {
                include: {
                  assignedBDM: { select: { id: true, name: true, email: true, businessId: true } },
                },
              },
            },
          },
        },
      }),
      prisma.trialSubscription.findMany({
        where: {
          status: "TRIAL",
          trialEndsAt: { gte: reminderStart, lt: reminderEnd },
          cancelledAt: null,
        },
        include: {
          business: { include: { users: true } },
        },
      }),
    ]);

    const conversionResults = await Promise.allSettled(
      dueTrials.map(async (trial) => {
        const charge = await attemptMandateCharge({
          mandateId: trial.razorpayMandateId,
          amount: trial.monthlyAmount,
        });
        const boss = trial.business.users.find((user) => user.role === "BOSS");
        const bdm = trial.business.onboardingLead?.assignedBDM;

        if (!charge.ok) {
          await prisma.trialSubscription.update({
            where: { id: trial.id },
            data: { status: "FAILED" },
          });

          await Promise.allSettled([
            boss
              ? sendEmail({
                  to: boss.email,
                  toName: boss.name,
                  subject: "Please update your BGOS payment method",
                  html: `<p>Hi ${boss.name},</p><p>We could not charge your BGOS subscription for <strong>${trial.business.name}</strong>. Please update your payment method to keep access active.</p>`,
                })
              : Promise.resolve(false),
            bdm
              ? sendEmail({
                  to: bdm.email,
                  toName: bdm.name,
                  subject: `${trial.business.name} payment failed`,
                  html: `<p>${trial.business.name}'s trial conversion payment failed. Please call the client today.</p><p>${charge.message}</p>`,
                })
              : Promise.resolve(false),
          ]);

          return { businessId: trial.businessId, converted: false };
        }

        const nowForCommission = new Date();
        const month = nowForCommission.getMonth() + 1;
        const year = nowForCommission.getFullYear();
        const commission = calculateFirstSaleCommission(trial.plan, {
          commissionMultiplier: 1,
        });
        const firstSaleCommission = commission.final;

        await prisma.$transaction([
          prisma.trialSubscription.update({
            where: { id: trial.id },
            data: { status: "ACTIVE", chargedAt: nowForCommission },
          }),
          ...(trial.business.onboardingLead
            ? [
                prisma.onboardingLead.update({
                  where: { id: trial.business.onboardingLead.id },
                  data: { status: "CONVERTED", convertedAt: nowForCommission },
                }),
              ]
            : []),
          ...(bdm
            ? [
                prisma.commission.create({
                  data: {
                    userId: bdm.id,
                    businessId: bdm.businessId ?? trial.businessId,
                    type: "FIRST_SALE",
                    planType: trial.plan,
                    dealValue: trial.monthlyAmount,
                    baseCommission: commission.base,
                    multiplier: commission.multiplier,
                    commissionAmt: firstSaleCommission,
                    status: "PAID",
                    paidAt: nowForCommission,
                    month,
                    year,
                  },
                }),
              ]
            : []),
        ]);

        await Promise.allSettled([
          boss
            ? sendEmail({
                to: boss.email,
                toName: boss.name,
                subject: "Your BGOS subscription is now active",
                html: `<p>Hi ${boss.name},</p><p>Your BGOS subscription is now active. ₹${trial.monthlyAmount.toLocaleString("en-IN")} has been charged.</p>`,
              })
            : Promise.resolve(false),
          bdm
            ? sendEmail({
                to: bdm.email,
                toName: bdm.name,
                subject: `Commission unlocked - ${trial.business.name}`,
                html: `<p>${trial.business.name} converted. ₹${firstSaleCommission.toLocaleString("en-IN")} has been added to your earnings.</p>`,
              })
            : Promise.resolve(false),
        ]);

        return { businessId: trial.businessId, converted: true };
      }),
    );

    const reminderResults = await Promise.allSettled(
      reminderTrials.map(async (trial) => {
        const boss = trial.business.users.find((user) => user.role === "BOSS");
        if (!boss) return null;

        return sendEmail({
          to: boss.email,
          toName: boss.name,
          subject: "Your BGOS free trial ends in 2 days",
          html: `<p>Hi ${boss.name},</p><p>Your free trial ends in 2 days. You will be charged ₹${trial.monthlyAmount.toLocaleString("en-IN")} on ${trial.trialEndsAt.toLocaleDateString("en-IN")}. Cancel anytime before then from your dashboard.</p>`,
        });
      }),
    );

    return NextResponse.json({
      conversionsProcessed: conversionResults.length,
      conversionsSucceeded: conversionResults.filter((item) => item.status === "fulfilled" && item.value.converted).length,
      remindersSent: reminderResults.filter((item) => item.status === "fulfilled").length,
    });
  } catch (error) {
    console.error("[cron:trial-conversion]", error);
    return NextResponse.json(
      { error: "Unable to process trial conversion." },
      { status: 500 },
    );
  }
}
