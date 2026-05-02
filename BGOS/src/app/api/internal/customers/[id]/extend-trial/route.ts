import { NextResponse } from "next/server";

import { sendEmail } from "@/lib/email";
import { requireInternalOwnerApi } from "@/lib/internal-owner";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const context = await requireInternalOwnerApi();
  if ("error" in context) return context.error;
  const body = (await request.json().catch(() => ({}))) as { days?: unknown };
  const days = Number(body.days) || 7;

  const business = await prisma.business.findUnique({
    where: { id: params.id },
    include: { users: { where: { role: "BOSS" }, take: 1 }, trialSubscription: true },
  });
  if (!business) return NextResponse.json({ error: "Customer not found." }, { status: 404 });

  const base = business.trialSubscription?.trialEndsAt ?? new Date();
  const trialEndsAt = new Date(base.getTime() + days * 86400000);
  const subscription = await prisma.trialSubscription.upsert({
    where: { businessId: params.id },
    create: {
      businessId: params.id,
      plan: "GROWTH",
      trialStartedAt: new Date(),
      trialEndsAt,
      monthlyAmount: 2499,
    },
    update: { trialEndsAt, status: "TRIAL" },
  });

  await Promise.allSettled([
    business.users[0]
      ? sendEmail({
          to: business.users[0].email,
          toName: business.users[0].name,
          subject: "Your BGOS trial has been extended",
          html: `<p>Your trial has been extended by ${days} days.</p>`,
        })
      : Promise.resolve(false),
    prisma.nexaInsight.create({
      data: {
        businessId: context.business.id,
        type: "action",
        message: `Trial extended for ${business.name} — ${days} days added.`,
        action: "Trial extended",
      },
    }),
  ]);

  return NextResponse.json({ business: { ...business, trialSubscription: subscription } });
}
