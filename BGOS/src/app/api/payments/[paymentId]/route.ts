import { NextResponse } from "next/server";

import auth from "@/lib/auth";
import "@/lib/payment-callbacks";
import { markPaymentFailed, markPaymentSucceeded } from "@/lib/payments";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: { paymentId: string } },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payment = await prisma.bgosPaymentIntent.findUnique({
    where: { id: params.paymentId },
    select: { id: true, userId: true, businessId: true, gateway: true },
  });

  if (!payment) {
    return NextResponse.json({ error: "Payment intent not found." }, { status: 404 });
  }

  const canManageBusinessPayments =
    session.user.role === "OWNER" ||
    session.user.role === "BOSS" ||
    session.user.role === "ADMIN";

  if (
    payment.userId !== session.user.id &&
    (payment.businessId !== session.user.businessId || !canManageBusinessPayments)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (payment.gateway !== "MANUAL") {
    return NextResponse.json(
      { error: "External gateway payments must be completed by provider webhooks." },
      { status: 409 },
    );
  }

  const body = (await request.json()) as {
    status?: "SUCCESS" | "FAILED";
    providerPaymentId?: string;
    metadata?: Record<string, unknown>;
  };

  if (body.status === "SUCCESS") {
    const completed = await markPaymentSucceeded(
      params.paymentId,
      body.providerPaymentId,
      body.metadata ?? {},
    );
    return NextResponse.json({ payment: completed });
  }

  if (body.status === "FAILED") {
    const failed = await markPaymentFailed(params.paymentId, body.metadata ?? {});
    return NextResponse.json({ payment: failed });
  }

  return NextResponse.json(
    { error: "status must be SUCCESS or FAILED." },
    { status: 400 },
  );
}
