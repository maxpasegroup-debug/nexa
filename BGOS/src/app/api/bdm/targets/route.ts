import { NextResponse } from "next/server";

import { getBdmContext, monthBounds } from "@/lib/bdm/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const context = await getBdmContext();

    if (context.error) return context.error;

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const userId = context.user.id;
    const target = await prisma.target.upsert({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
      create: {
        userId,
        month,
        year,
        wonTarget: 6,
        revenueTarget: 30000,
        fixedSalary: 0,
        maxIncentive: 30000,
      },
      update: {},
    });

    await prisma.bDMWallet.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    const monthStart = new Date(year, month - 1, 1);
    const commissions = await prisma.commission.findMany({
      where: {
        userId,
        status: "EARNED",
        createdAt: { gte: monthStart },
      },
      orderBy: { createdAt: "desc" },
    });

    const currentEarnings = commissions.reduce(
      (sum, commission) => sum + (commission.amount || commission.commissionAmt || 0),
      0,
    );
    const progressPct = target.revenueTarget > 0
      ? Math.min(100, Math.round((currentEarnings / target.revenueTarget) * 100))
      : 0;
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysElapsed = now.getDate();
    const daysRemaining = daysInMonth - daysElapsed;
    const dailyRate = daysElapsed > 0 ? currentEarnings / daysElapsed : 0;
    const projectedEarnings = Math.round(dailyRate * daysInMonth);
    const { SLAB_THRESHOLDS } = await import("@/lib/commission-engine");
    const currentSlab = SLAB_THRESHOLDS.find((slab) => currentEarnings >= slab.min && slab.name !== "NONE");
    const nextSlab = [...SLAB_THRESHOLDS]
      .reverse()
      .find((slab) => slab.min > currentEarnings && slab.name !== "NONE");
    const dealsThisMonth = await prisma.business.count({
      where: {
        bdmId: userId,
        status: { in: ["ACTIVE", "TRIAL"] },
        firstPaymentAt: { gte: monthStart },
      },
    });

    const amount = (type: string) =>
      commissions
        .filter((commission) => commission.type === type)
        .reduce((sum, commission) => sum + (commission.amount || commission.commissionAmt || 0), 0);

    return NextResponse.json({
      target,
      currentEarnings,
      progressPct,
      dealsThisMonth,
      daysElapsed,
      daysRemaining,
      projectedEarnings,
      currentSlab: currentSlab?.name || "NONE",
      currentSlabBonus: currentSlab?.bonus || 0,
      nextSlabName: nextSlab?.name || null,
      nextSlabAmount: nextSlab?.bonus || 0,
      nextSlabThreshold: nextSlab?.min || 0,
      amountToNextSlab: nextSlab ? Math.max(0, nextSlab.min - currentEarnings) : 0,
      breakdown: {
        planFirst: amount("PLAN_FIRST_SALE") + amount("FIRST_SALE"),
        planRenewal: amount("PLAN_RENEWAL") + amount("RENEWAL"),
        agentFirst: amount("AGENT_FIRST_SALE"),
        agentRenewal: amount("AGENT_RENEWAL"),
        slabBonus: amount("SLAB_BONUS"),
      },
      nextMilestone: nextSlab
        ? `Earn ₹${(nextSlab.min - currentEarnings).toLocaleString("en-IN")} more to unlock ${nextSlab.name} - ₹${nextSlab.bonus.toLocaleString("en-IN")} bonus`
        : currentSlab
          ? `You are at ${currentSlab.name} slab this month!`
          : "Earn ₹7,500 to unlock Bronze slab and earn ₹3,000 bonus",
      recentTransactions: commissions.slice(0, 10).map((commission) => ({
        id: commission.id,
        type: commission.type,
        amount: commission.amount || commission.commissionAmt || 0,
        businessId: commission.businessId,
        agentSlug: commission.agentSlug,
        createdAt: commission.createdAt,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch target." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const context = await getBdmContext(["BOSS", "OWNER"]);

    if (context.error) return context.error;

    const { userId, leadsTarget, wonTarget, revenueTarget } = await request.json();

    if (typeof userId !== "string") {
      return NextResponse.json({ error: "userId is required." }, { status: 400 });
    }

    const targetUser = await prisma.user.findFirst({
      where: {
        id: userId,
        businessId: context.businessId,
        role: "BDM",
      },
      select: { id: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "BDM not found in this business." },
        { status: 404 },
      );
    }

    const month = monthBounds();
    const target = await prisma.target.upsert({
      where: {
        userId_month_year: {
          userId,
          month: month.month,
          year: month.year,
        },
      },
      update: {
        leadsTarget: Number(leadsTarget ?? 0),
        wonTarget: Number(wonTarget ?? 0),
        revenueTarget: Number(revenueTarget ?? 0),
      },
      create: {
        userId,
        month: month.month,
        year: month.year,
        leadsTarget: Number(leadsTarget ?? 0),
        wonTarget: Number(wonTarget ?? 0),
        revenueTarget: Number(revenueTarget ?? 0),
      },
    });

    return NextResponse.json({ target });
  } catch {
    return NextResponse.json(
      { error: "Unable to save target." },
      { status: 500 },
    );
  }
}
