import { NextResponse } from "next/server";

import auth from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { getString } from "@/lib/onboarding-flow";
import { prisma } from "@/lib/prisma";

const allowedReasons = new Set([
  "too_expensive",
  "missing_features",
  "not_the_right_time",
  "found_another_tool",
  "other",
]);

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "BOSS" || !session.user.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const reason = getString(body.reason);
    const cancelReason = allowedReasons.has(reason) ? reason : "other";

    const business = await prisma.business.findUnique({
      where: { id: session.user.businessId },
      include: {
        users: true,
        trialSubscription: true,
        onboardingLead: true,
      },
    });

    if (!business?.trialSubscription) {
      return NextResponse.json({ error: "Trial subscription not found." }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.trialSubscription.update({
        where: { businessId: business.id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancelReason,
        },
      }),
      prisma.user.updateMany({
        where: {
          businessId: business.id,
          role: { in: ["BDM", "SDE"] },
        },
        data: { active: false },
      }),
      ...(business.onboardingLead
        ? [
            prisma.onboardingLead.update({
              where: { id: business.onboardingLead.id },
              data: {
                status: "CANCELLED",
                cancelledAt: new Date(),
              },
            }),
          ]
        : []),
    ]);

    const boss = business.users.find((user) => user.role === "BOSS");
    if (boss) {
      await sendEmail({
        to: boss.email,
        toName: boss.name,
        subject: "Your BGOS trial has been cancelled",
        html: `<p>Hi ${boss.name},</p><p>Your BGOS trial for <strong>${business.name}</strong> has been cancelled. Your data will be saved for 30 days.</p>`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[trial:cancel]", error);
    return NextResponse.json(
      { error: "Unable to cancel trial." },
      { status: 500 },
    );
  }
}
