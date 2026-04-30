import { NextResponse } from "next/server";

import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await prisma.trialSubscription.findUnique({
    where: { businessId: session.user.businessId },
    select: {
      id: true,
      plan: true,
      status: true,
      trialStartedAt: true,
      trialEndsAt: true,
      monthlyAmount: true,
      autoPayEnabled: true,
      razorpayMandateId: true,
      razorpayCustomerId: true,
    },
  });

  if (!subscription) {
    return NextResponse.json({ subscription: null });
  }

  return NextResponse.json({
    subscription: {
      ...subscription,
      trialStartedAt: subscription.trialStartedAt.toISOString(),
      trialEndsAt: subscription.trialEndsAt.toISOString(),
    },
  });
}
