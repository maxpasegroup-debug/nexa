import { NextRequest, NextResponse } from "next/server";

import { calcRenewal } from "@/lib/commission";
import { verifyCronSecret } from "@/lib/cron-guard";
import { prisma } from "@/lib/prisma";

function nextMonth(date: Date) {
  const value = new Date(date);
  value.setMonth(value.getMonth() + 1);
  return value;
}

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const [payingCustomers, expiredTrials] = await Promise.all([
      prisma.customerPortfolio.findMany({
        where: {
          status: "PAYING",
          renewalCount: { lt: 24 },
        },
        include: {
          user: { select: { id: true, businessId: true } },
          lead: { select: { id: true, name: true } },
        },
      }),
      prisma.customerPortfolio.findMany({
        where: {
          status: "TRIAL",
          trialEndsAt: { lt: now },
        },
        include: {
          user: { select: { id: true, businessId: true } },
          lead: { select: { id: true, name: true } },
        },
      }),
    ]);

    const renewalResults = await Promise.allSettled(
      payingCustomers.map(async (customer) => {
        const renewalAmt = calcRenewal(customer.planType);
        if (renewalAmt <= 0 || !customer.user.businessId) return null;

        await prisma.commission.create({
          data: {
            userId: customer.userId,
            businessId: customer.user.businessId,
            type: "RENEWAL",
            planType: customer.planType,
            dealValue: customer.monthlyValue,
            commissionAmt: renewalAmt,
            month,
            year,
          },
        });

        return prisma.customerPortfolio.update({
          where: { id: customer.id },
          data: {
            renewalCount: { increment: 1 },
            lastRenewalAt: now,
            nextRenewalAt: nextMonth(now),
            totalEarned: { increment: renewalAmt },
          },
        });
      }),
    );

    const trialResults = await Promise.allSettled(
      expiredTrials.map(async (customer) => {
        await prisma.customerPortfolio.update({
          where: { id: customer.id },
          data: { status: "OVERDUE" },
        });

        if (!customer.user.businessId) return null;

        return prisma.nexaInsight.create({
          data: {
            businessId: customer.user.businessId,
            type: "warning",
            message: `Trial expired for ${customer.lead.name}. Follow up today to convert to paying.`,
            action: "Follow up",
          },
        });
      }),
    );

    return NextResponse.json({
      processedRenewals: renewalResults.filter(
        (item) => item.status === "fulfilled",
      ).length,
      expiredTrials: trialResults.filter((item) => item.status === "fulfilled")
        .length,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to process renewals." },
      { status: 500 },
    );
  }
}
