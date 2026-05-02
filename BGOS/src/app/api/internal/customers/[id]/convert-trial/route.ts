import { NextResponse } from "next/server";

import { sendEmail } from "@/lib/email";
import { requireInternalOwnerApi } from "@/lib/internal-owner";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const context = await requireInternalOwnerApi();
  if ("error" in context) return context.error;

  const business = await prisma.business.findUnique({
    where: { id: params.id },
    include: {
      users: { where: { role: "BOSS" }, take: 1 },
      trialSubscription: true,
      onboardingLead: { include: { assignedBDM: true } },
    },
  });
  if (!business) return NextResponse.json({ error: "Customer not found." }, { status: 404 });

  await prisma.$transaction([
    prisma.business.update({ where: { id: params.id }, data: { status: "ACTIVE" } }),
    prisma.trialSubscription.upsert({
      where: { businessId: params.id },
      create: {
        businessId: params.id,
        plan: "GROWTH",
        trialStartedAt: new Date(),
        trialEndsAt: new Date(),
        monthlyAmount: 2499,
        status: "ACTIVE",
        chargedAt: new Date(),
      },
      update: { status: "ACTIVE", chargedAt: new Date(), trialEndsAt: new Date() },
    }),
  ]);

  const bdm = business.onboardingLead?.assignedBDM;
  if (bdm) {
    const now = new Date();
    await prisma.commission.create({
      data: {
        userId: bdm.id,
        businessId: business.id,
        type: "FIRST_SALE",
        planType: business.trialSubscription?.plan ?? "GROWTH",
        dealValue: business.trialSubscription?.monthlyAmount ?? 2499,
        commissionAmt: Math.round((business.trialSubscription?.monthlyAmount ?? 2499) * 0.2),
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    }).catch(() => null);
  }

  if (business.users[0]) {
    await sendEmail({
      to: business.users[0].email,
      toName: business.users[0].name,
      subject: "Welcome to BGOS",
      html: `<p>Your BGOS workspace is now active. Welcome aboard.</p>`,
    }).catch(() => false);
  }

  return NextResponse.json({ success: true });
}
