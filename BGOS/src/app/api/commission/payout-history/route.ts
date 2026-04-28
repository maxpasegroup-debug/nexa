import { NextResponse } from "next/server";

import { getCommissionContext } from "@/lib/commission-context";
import { prisma } from "@/lib/prisma";

function recentMonths(count: number) {
  const months: Array<{ month: number; year: number; label: string }> = [];
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  });

  for (let index = 0; index < count; index += 1) {
    const date = new Date();
    date.setMonth(date.getMonth() - index, 1);
    months.push({
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      label: formatter.format(date),
    });
  }

  return months;
}

export async function GET() {
  try {
    const context = await getCommissionContext();
    if (context.error) return context.error;

    const months = recentMonths(6);
    const records = await prisma.payoutHistory.findMany({
      where: {
        userId: context.user.id,
        OR: months.map((item) => ({ month: item.month, year: item.year })),
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    return NextResponse.json({
      payouts: months.map((item) => {
        const record = records.find(
          (entry) => entry.month === item.month && entry.year === item.year,
        );

        return {
          id: record?.id ?? null,
          month: item.month,
          year: item.year,
          label: item.label,
          firstSale: record?.firstSale ?? 0,
          renewal: record?.renewal ?? 0,
          slabBonus: record?.slabBonus ?? 0,
          total: record?.total ?? 0,
          status: record?.status ?? "pending",
          paidAt: record?.paidAt ?? null,
          notes: record?.notes ?? null,
        };
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch payout history." },
      { status: 500 },
    );
  }
}
