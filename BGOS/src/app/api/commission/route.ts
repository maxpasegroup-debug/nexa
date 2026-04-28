import { NextResponse } from "next/server";

import {
  calcMonthlyEarnings,
  getCurrentSlab,
  getNextMilestone,
  projectMonthEnd,
} from "@/lib/commission";
import { getCommissionContext, monthBounds } from "@/lib/commission-context";
import { prisma } from "@/lib/prisma";

const MONTHLY_TARGET = 30000;

export async function GET() {
  try {
    const context = await getCommissionContext();
    if (context.error) return context.error;

    const now = new Date();
    const { start, end, month, year } = monthBounds(now);
    const daysElapsed = now.getDate();
    const totalDays = new Date(year, month, 0).getDate();
    const daysRemaining = Math.max(0, totalDays - daysElapsed);

    const [earnings, currentSlab, dealsThisMonth, commissions] =
      await Promise.all([
        calcMonthlyEarnings(context.user.id, month, year),
        getCurrentSlab(context.user.id, month, year),
        prisma.commission.count({
          where: {
            userId: context.user.id,
            month,
            year,
            type: "FIRST_SALE",
            status: { not: "CLAWBACK" },
          },
        }),
        prisma.commission.findMany({
          where: {
            userId: context.user.id,
            createdAt: { gte: start, lt: end },
          },
          orderBy: { createdAt: "desc" },
          include: {
            lead: { select: { id: true, name: true, phone: true, company: true } },
          },
        }),
      ]);

    return NextResponse.json({
      firstSale: earnings.firstSale,
      renewal: earnings.renewal,
      slab: earnings.slab,
      total: earnings.total,
      target: MONTHLY_TARGET,
      progressPct: (earnings.total / MONTHLY_TARGET) * 100,
      currentSlab,
      nextMilestone: getNextMilestone(dealsThisMonth),
      projectedTotal: projectMonthEnd(earnings.total, daysElapsed, totalDays),
      daysElapsed,
      daysRemaining,
      dealsThisMonth,
      commissions,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch commissions." },
      { status: 500 },
    );
  }
}
