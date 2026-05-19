import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import {
  recordNiceJobsReferral,
  verifyNiceJobsWebhookSignature,
  type NiceJobsReferralPayload,
} from "@/lib/nicejobs/referrals";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-nicejobs-signature");
  const source = request.headers.get("x-nicejobs-source") || "bgos";
  let payload: NiceJobsReferralPayload;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const eventId = payload.eventId || randomUUID();
  const signatureOk = verifyNiceJobsWebhookSignature(rawBody, signature);

  const event = await prisma.niceJobsWebhookEvent.upsert({
    where: { eventId },
    create: {
      source,
      eventId,
      signatureOk,
      status: signatureOk ? "RECEIVED" : "REJECTED",
      payload: payload as object,
      error: signatureOk ? null : "Invalid webhook signature",
    },
    update: {
      payload: payload as object,
      signatureOk,
      status: signatureOk ? "RECEIVED" : "REJECTED",
      error: signatureOk ? null : "Invalid webhook signature",
    },
  });

  if (!signatureOk) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const referral = await recordNiceJobsReferral({ ...payload, eventId }, payload);
    await prisma.niceJobsWebhookEvent.update({
      where: { id: event.id },
      data: { status: "PROCESSED", processedAt: new Date() },
    });

    return NextResponse.json({
      ok: true,
      referralId: referral.id,
      status: referral.status,
      earningsOwed: referral.earningsOwed,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to process referral";

    await prisma.niceJobsWebhookEvent.update({
      where: { id: event.id },
      data: { status: "FAILED", error: message, processedAt: new Date() },
    });

    return NextResponse.json({ error: message }, { status: 422 });
  }
}
