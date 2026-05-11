import { NextResponse } from "next/server";

import "@/lib/payment-callbacks";
import { getBlizzwayCreditPackage } from "@/lib/blizzway-pricing";
import { getCareer7Context } from "@/lib/career7-auth";
import { createPaymentIntent } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const authResult = await getCareer7Context(request);
  if (authResult.response) return authResult.response;

  const body = (await request.json()) as {
    packageId?: string;
    packageSlug?: string;
    gateway?: "RAZORPAY" | "STRIPE" | "PAYPAL" | "CASHFREE" | "MANUAL";
    idempotencyKey?: string;
  };
  const selectedPackage = await getBlizzwayCreditPackage(body.packageId ?? body.packageSlug ?? "");

  if (!selectedPackage) {
    return NextResponse.json({ error: "Invalid Blizzway credit package." }, { status: 400 });
  }

  const context = authResult.context;
  const order = await createPaymentIntent({
    businessModel: context.businessModel,
    businessId: context.businessId,
    userId: context.userId,
    amount: selectedPackage.priceInr * 100,
    credits: selectedPackage.totalCredits,
    description: `Blizzway ${selectedPackage.name} credit pack`,
    gateway: body.gateway,
    idempotencyKey:
      body.idempotencyKey ??
      `blizzway:top-up-order:${context.businessId}:${context.userId}:${selectedPackage.slug}:${Date.now()}`,
    metadata: {
      packageId: selectedPackage.id,
      packageSlug: selectedPackage.slug,
      packageName: selectedPackage.name,
      priceInr: selectedPackage.priceInr,
      baseCredits: selectedPackage.baseCredits,
      bonusCredits: selectedPackage.bonusCredits,
      totalCredits: selectedPackage.totalCredits,
    },
  });

  return NextResponse.json(
    { payment: order.payment, checkout: order.checkout, package: selectedPackage },
    { status: 201 },
  );
}
