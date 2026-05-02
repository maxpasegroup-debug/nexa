import { NextResponse } from "next/server";

import { requireInternalOwnerApi } from "@/lib/internal-owner";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const context = await requireInternalOwnerApi();
  if ("error" in context) return context.error;

  const business = await prisma.business.findUnique({
    where: { id: params.id },
    include: { trialSubscription: true },
  });

  if (!business) {
    return NextResponse.json({ error: "Customer not found." }, { status: 404 });
  }

  if (business.status !== "RENEWAL_FAILED") {
    return NextResponse.json(
      { error: "Retry is only available for failed renewals." },
      { status: 400 },
    );
  }

  await prisma.nexaInsight.create({
    data: {
      businessId: business.id,
      type: "PAYMENT_RETRY_REQUESTED",
      message:
        "A BGOS billing retry has been requested. Your account manager will confirm the renewal status shortly.",
      action: "Update payment method",
    },
  });

  return NextResponse.json({
    success: true,
    message: "Retry request logged.",
  });
}
