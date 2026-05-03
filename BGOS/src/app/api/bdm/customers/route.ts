import { NextResponse } from "next/server";

import { getBdmContext } from "@/lib/bdm/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function daysUntil(value?: Date | null) {
  if (!value) return null;
  return Math.max(0, Math.floor((value.getTime() - Date.now()) / 86_400_000));
}

function hoursUntil(value?: Date | null) {
  if (!value) return null;
  return Math.max(0, Math.floor((value.getTime() - Date.now()) / 3_600_000));
}

export async function GET() {
  try {
    const context = await getBdmContext();
    if (context.error) return context.error;

    const customers = await prisma.business.findMany({
      where: {
        status: { in: ["TRIAL", "ACTIVE", "RENEWAL_FAILED", "SUSPENDED"] },
        OR: [
          { commissions: { some: { userId: context.user.id } } },
          { leads: { some: { assignedTo: context.user.id } } },
          { leads: { some: { createdBy: context.user.id } } },
        ],
      },
      include: {
        trialSubscription: true,
        users: {
          where: { role: "BOSS" },
          select: { name: true, phone: true, email: true },
        },
        commissions: {
          where: { userId: context.user.id },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { users: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    const enriched = customers.map((customer) => {
      const boss = customer.users[0];
      const firstSale = customer.commissions.filter((commission) => commission.type === "FIRST_SALE");
      const renewal = customer.commissions.filter((commission) => commission.type === "RENEWAL");

      return {
        id: customer.id,
        clientId: customer.clientId,
        name: customer.name,
        plan: customer.trialSubscription?.plan ?? "Trial",
        monthlyAmount: customer.trialSubscription?.monthlyAmount ?? 0,
        status: customer.status,
        trialEndsAt: customer.trialEndsAt,
        nextBillingDate: customer.nextBillingDate,
        renewalFailedAt: customer.renewalFailedAt,
        gracePeriodEndsAt: customer.gracePeriodEndsAt,
        suspendedAt: customer.suspendedAt,
        totalUsers: customer._count.users,
        bossName: boss?.name ?? null,
        bossPhone: boss?.phone ?? null,
        bossEmail: boss?.email ?? null,
        myCommissionEarned: firstSale.reduce((sum, commission) => sum + commission.commissionAmt, 0),
        myRenewalEarned: renewal.reduce((sum, commission) => sum + commission.commissionAmt, 0),
        hoursUntilSuspension: hoursUntil(customer.gracePeriodEndsAt),
        daysUntilTrialExpiry: daysUntil(customer.trialEndsAt),
        daysUntilRenewal: daysUntil(customer.nextBillingDate),
      };
    });

    const live = enriched.filter((customer) => ["TRIAL", "ACTIVE"].includes(customer.status));
    const notRenewed = enriched.filter((customer) =>
      ["RENEWAL_FAILED", "SUSPENDED"].includes(customer.status),
    );

    return NextResponse.json({
      live,
      notRenewed,
      totalLive: enriched.filter((customer) => customer.status === "ACTIVE").length,
      totalTrial: enriched.filter((customer) => customer.status === "TRIAL").length,
      totalAtRisk: notRenewed.length,
      monthlyRecurring: enriched
        .filter((customer) => customer.status === "ACTIVE")
        .reduce((sum, customer) => sum + customer.monthlyAmount, 0),
    });
  } catch (error) {
    console.error("[bdm-customers:list]", error);
    return NextResponse.json({ error: "Unable to fetch BDM customers." }, { status: 500 });
  }
}
