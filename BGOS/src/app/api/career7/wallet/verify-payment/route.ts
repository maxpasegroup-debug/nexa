import { NextResponse } from "next/server";

import "@/lib/payment-callbacks";
import { getCareer7Context } from "@/lib/career7-auth";
import { verifyPaymentIntent } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const authResult = await getCareer7Context(request);
  if (authResult.response) return authResult.response;

  const body = (await request.json()) as {
    paymentId?: string;
    providerPaymentId?: string;
    providerOrderId?: string;
    signature?: string;
    metadata?: Record<string, unknown>;
  };

  if (!body.paymentId) {
    return NextResponse.json({ error: "paymentId is required." }, { status: 400 });
  }

  try {
    const result = await verifyPaymentIntent({
      paymentId: body.paymentId,
      businessModel: authResult.context.businessModel,
      businessId: authResult.context.businessId,
      userId: authResult.context.userId,
      providerPaymentId: body.providerPaymentId,
      providerOrderId: body.providerOrderId,
      signature: body.signature,
      metadata: body.metadata ?? {},
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payment verification failed." },
      { status: 400 },
    );
  }
}
