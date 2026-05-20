import crypto from "crypto";

import { prisma } from "@/lib/prisma";

export type NiceJobsReferralPayload = {
  event?: string;
  eventId?: string;
  event_id?: string;
  referralCode?: string;
  referral_code?: string;
  userId?: string;
  user_id?: string;
  franchiseSlug?: string;
  franchise?: string;
  franchiseId?: string;
  saleAmount?: number;
  purchase_amount?: number;
  gst_amount?: number;
  net_amount?: number;
  currency?: string;
  timestamp?: string;
  conversionStatus?: string;
  conversion_status?: string;
  externalCustomerRef?: string;
  customer_id?: string;
};

export function verifyNiceJobsWebhookSignature(rawBody: string, signature: string | null) {
  const secret = process.env.NICEJOBS_WEBHOOK_SECRET;
  if (!secret) return true;
  if (!signature) return false;

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const normalizedSignature = signature.replace("sha256=", "");

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(normalizedSignature));
}

export async function recordNiceJobsReferral(payload: NiceJobsReferralPayload, rawPayload: unknown) {
  const eventId = payload.eventId || payload.event_id || crypto.randomUUID();
  const grossAmount = Number(payload.saleAmount || payload.purchase_amount || payload.net_amount || 0);
  const netAmount = Number(payload.net_amount || grossAmount);

  if (!grossAmount || grossAmount <= 0) {
    throw new Error("Invalid saleAmount");
  }

  const existingReferral = await prisma.niceJobsReferral.findUnique({
    where: { externalEventId: eventId },
  });

  if (existingReferral) return existingReferral;

  const referralCode = payload.referralCode || payload.referral_code;
  const franchiseSlug =
    payload.franchiseSlug ||
    (payload.franchise?.toLowerCase() === "career7" ? "career7-in" : undefined);
  const conversionStatus = payload.conversionStatus || payload.conversion_status;

  const application = referralCode
    ? await prisma.niceJobsApplication.findUnique({
        where: { referralCode },
        include: { franchise: true },
      })
    : await prisma.niceJobsApplication.findFirst({
        where: {
          userId: payload.userId || payload.user_id,
          franchise: franchiseSlug ? { slug: franchiseSlug } : undefined,
          franchiseId: payload.franchiseId,
        },
        include: { franchise: true },
      });

  if (!application) {
    throw new Error("Matching NICEJOBS application not found");
  }

  const commissionPercent = Number(application.franchise.commissionPercent);
  const earningsOwed = Number(((netAmount * commissionPercent) / 100).toFixed(2));
  const validStatuses = ["PENDING_APPROVAL", "APPROVED", "ACTIVE"];
  const status =
    (conversionStatus === "confirmed" || payload.event === "purchase_complete") &&
    validStatuses.includes(application.status)
      ? "VALIDATED"
      : "PENDING";

  const referral = await prisma.niceJobsReferral.create({
    data: {
      userId: application.userId,
      franchiseId: application.franchiseId,
      applicationId: application.id,
      externalEventId: eventId,
      externalCustomerRef: payload.externalCustomerRef || payload.customer_id,
      saleAmount: grossAmount,
      currency: payload.currency || "INR",
      commissionPercent,
      earningsOwed,
      status,
      webhookTimestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
      validatedAt: status === "VALIDATED" ? new Date() : null,
      rawPayload: rawPayload as object,
    },
  });

  return referral;
}
