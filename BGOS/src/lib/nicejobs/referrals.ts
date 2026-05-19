import crypto from "crypto";

import { prisma } from "@/lib/prisma";

export type NiceJobsReferralPayload = {
  eventId?: string;
  referralCode?: string;
  userId?: string;
  franchiseSlug?: string;
  franchiseId?: string;
  saleAmount?: number;
  currency?: string;
  timestamp?: string;
  conversionStatus?: string;
  externalCustomerRef?: string;
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
  const eventId = payload.eventId || crypto.randomUUID();
  const saleAmount = Number(payload.saleAmount || 0);

  if (!saleAmount || saleAmount <= 0) {
    throw new Error("Invalid saleAmount");
  }

  const existingReferral = await prisma.niceJobsReferral.findUnique({
    where: { externalEventId: eventId },
  });

  if (existingReferral) return existingReferral;

  const application = payload.referralCode
    ? await prisma.niceJobsApplication.findUnique({
        where: { referralCode: payload.referralCode },
        include: { franchise: true },
      })
    : await prisma.niceJobsApplication.findFirst({
        where: {
          userId: payload.userId,
          franchise: payload.franchiseSlug ? { slug: payload.franchiseSlug } : undefined,
          franchiseId: payload.franchiseId,
        },
        include: { franchise: true },
      });

  if (!application) {
    throw new Error("Matching NICEJOBS application not found");
  }

  const commissionPercent = Number(application.franchise.commissionPercent);
  const earningsOwed = Number(((saleAmount * commissionPercent) / 100).toFixed(2));
  const validStatuses = ["PENDING_APPROVAL", "APPROVED", "ACTIVE"];
  const status =
    payload.conversionStatus === "confirmed" && validStatuses.includes(application.status)
      ? "VALIDATED"
      : "PENDING";

  const referral = await prisma.niceJobsReferral.create({
    data: {
      userId: application.userId,
      franchiseId: application.franchiseId,
      applicationId: application.id,
      externalEventId: eventId,
      externalCustomerRef: payload.externalCustomerRef,
      saleAmount,
      currency: payload.currency || "GBP",
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
