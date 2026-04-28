import { NextResponse } from "next/server";

import { getCommissionContext, monthBounds } from "@/lib/commission-context";
import { prisma } from "@/lib/prisma";

function sumCommission(
  rows: Array<{ userId: string; commissionAmt: number }>,
  userId: string,
) {
  return rows
    .filter((row) => row.userId === userId)
    .reduce((sum, row) => sum + row.commissionAmt, 0);
}

export async function GET() {
  try {
    const context = await getCommissionContext();
    if (context.error) return context.error;

    const now = new Date();
    const current = monthBounds(now);
    const previous = monthBounds(new Date(now.getFullYear(), now.getMonth() - 1, 1));

    const [bdes, currentCommissions, previousCommissions] = await Promise.all([
      prisma.user.findMany({
        where: {
          businessId: context.businessId,
          role: "BDM",
        },
        select: { id: true, name: true },
      }),
      prisma.commission.findMany({
        where: {
          businessId: context.businessId,
          month: current.month,
          year: current.year,
          status: { not: "CLAWBACK" },
        },
        select: {
          userId: true,
          type: true,
          commissionAmt: true,
        },
      }),
      prisma.commission.findMany({
        where: {
          businessId: context.businessId,
          month: previous.month,
          year: previous.year,
          status: { not: "CLAWBACK" },
        },
        select: {
          userId: true,
          commissionAmt: true,
        },
      }),
    ]);

    const ranked = bdes
      .map((user) => {
        const totalThisMonth = sumCommission(currentCommissions, user.id);
        const lastMonth = sumCommission(previousCommissions, user.id);
        const dealsThisMonth = currentCommissions.filter(
          (row) => row.userId === user.id && row.type === "FIRST_SALE",
        ).length;
        return {
          userId: user.id,
          name: user.name,
          dealsThisMonth,
          totalThisMonth,
          trend:
            totalThisMonth > lastMonth
              ? "up"
              : totalThisMonth < lastMonth
                ? "down"
                : "same",
        };
      })
      .sort((a, b) => b.totalThisMonth - a.totalThisMonth)
      .map((item, index) => ({ rank: index + 1, ...item }));

    const topFive = ranked.slice(0, 5);
    const currentUser = ranked.find((item) => item.userId === context.user.id);

    return NextResponse.json({
      leaderboard: topFive,
      currentUser,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch commission leaderboard." },
      { status: 500 },
    );
  }
}
