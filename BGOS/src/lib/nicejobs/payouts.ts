"use server";

import { revalidatePath } from "next/cache";

import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requirePayoutAdmin() {
  const session = await auth();
  const role = session?.user?.role;

  if (!session?.user?.id || !["OWNER", "ADMIN"].includes(String(role))) {
    throw new Error("Not authorized");
  }

  return session.user;
}

function decimalToNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && "toNumber" in value) {
    return (value as { toNumber: () => number }).toNumber();
  }

  return Number(value || 0);
}

export async function generateNiceJobsMonthlyPayouts(formData: FormData) {
  const actor = await requirePayoutAdmin();
  const now = new Date();
  const month = Number(formData.get("month") || now.getMonth() + 1);
  const year = Number(formData.get("year") || now.getFullYear());
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  const scheduledDate = new Date(year, month, 1);

  const referrals = await prisma.niceJobsReferral.findMany({
    where: {
      status: { in: ["VALIDATED", "APPROVED"] },
      createdAt: { gte: start, lt: end },
    },
  });

  const grouped = new Map<string, { userId: string; currency: string; total: number }>();

  for (const referral of referrals) {
    const key = `${referral.userId}:${referral.currency}`;
    const existing = grouped.get(key) || {
      userId: referral.userId,
      currency: referral.currency,
      total: 0,
    };
    existing.total += decimalToNumber(referral.earningsOwed);
    grouped.set(key, existing);
  }

  for (const group of Array.from(grouped.values())) {
    await prisma.niceJobsPayout.upsert({
      where: {
        userId_month_year_currency: {
          userId: group.userId,
          month,
          year,
          currency: group.currency,
        },
      },
      create: {
        userId: group.userId,
        month,
        year,
        currency: group.currency,
        totalAmount: Number(group.total.toFixed(2)),
        status: "SCHEDULED",
        scheduledDate,
        provider: "MANUAL",
      },
      update: {
        totalAmount: Number(group.total.toFixed(2)),
        status: "SCHEDULED",
        scheduledDate,
      },
    });
  }

  await prisma.niceJobsAuditLog.create({
    data: {
      actorId: actor.id,
      action: "payouts.generated",
      entity: "NiceJobsPayout",
      entityId: `${year}-${month}`,
      metadata: { month, year, count: grouped.size },
    },
  });

  revalidatePath("/internal/nicejobs");
  revalidatePath("/nicejobs/payouts");
}

export async function updateNiceJobsPayoutStatus(formData: FormData) {
  const actor = await requirePayoutAdmin();
  const payoutId = String(formData.get("payoutId") || "");
  const status = String(formData.get("status") || "");

  if (!payoutId || !status) throw new Error("Missing payout status");

  await prisma.niceJobsPayout.update({
    where: { id: payoutId },
    data: {
      status,
      paidDate: status === "PAID" ? new Date() : undefined,
    },
  });

  await prisma.niceJobsAuditLog.create({
    data: {
      actorId: actor.id,
      action: "payout.status.updated",
      entity: "NiceJobsPayout",
      entityId: payoutId,
      metadata: { status },
    },
  });

  revalidatePath("/internal/nicejobs");
  revalidatePath("/nicejobs/payouts");
}
