import { NextResponse } from "next/server";

import { calcRenewal } from "@/lib/commission";
import { getCommissionContext } from "@/lib/commission-context";
import { prisma } from "@/lib/prisma";

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

export async function GET() {
  try {
    const context = await getCommissionContext();
    if (context.error) return context.error;

    const churnedSince = daysAgo(30);
    const portfolio = await prisma.customerPortfolio.findMany({
      where: {
        userId: context.user.id,
        OR: [
          { status: { in: ["PAYING", "TRIAL", "OVERDUE"] } },
          { status: "CHURNED", updatedAt: { gte: churnedSince } },
        ],
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
            company: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const paying = portfolio.filter((item) => item.status === "PAYING");
    const trial = portfolio.filter((item) => item.status === "TRIAL");
    const overdue = portfolio.filter((item) => item.status === "OVERDUE");
    const churned = portfolio.filter((item) => item.status === "CHURNED");

    return NextResponse.json({
      paying,
      trial,
      overdue,
      churned,
      summary: {
        totalPaying: paying.length,
        totalTrial: trial.length,
        monthlyRenewalIncome: paying.reduce(
          (sum, item) => sum + calcRenewal(item.planType),
          0,
        ),
        atRiskCount: 0,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch customer portfolio." },
      { status: 500 },
    );
  }
}
