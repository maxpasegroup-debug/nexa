import { NextResponse } from "next/server";

import auth from "@/lib/auth";
import { getCurrentSlab } from "@/lib/commission";
import { monthBounds } from "@/lib/commission-context";
import { prisma } from "@/lib/prisma";

const MONTHLY_TARGET = 30000;

function latestDate(...values: Array<Date | null | undefined>) {
  const timestamps = values
    .filter((value): value is Date => Boolean(value))
    .map((value) => value.getTime());

  if (timestamps.length === 0) return null;
  return new Date(Math.max(...timestamps));
}

function sumByType(
  rows: Array<{ type: string; commissionAmt: number }>,
  type: string,
) {
  return rows
    .filter((row) => row.type === type)
    .reduce((sum, row) => sum + row.commissionAmt, 0);
}

function slabTotal(rows: Array<{ type: string; commissionAmt: number }>) {
  return rows
    .filter((row) => row.type.startsWith("SLAB_"))
    .reduce((sum, row) => sum + row.commissionAmt, 0);
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const boss = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, businessId: true },
    });

    if (!boss?.businessId || boss.role !== "BOSS") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const current = monthBounds(now);
    const previous = monthBounds(new Date(now.getFullYear(), now.getMonth() - 1, 1));

    const bdes = await prisma.user.findMany({
      where: { businessId: boss.businessId, role: "BDM" },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        updatedAt: true,
        bdeCommissions: {
          where: {
            month: current.month,
            year: current.year,
            status: { not: "CLAWBACK" },
          },
          select: { type: true, commissionAmt: true },
        },
        customerPortfolio: {
          select: { status: true },
        },
        activityLogs: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
        leadActivities: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
        callLogs: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
    });

    const previousCommissions = await prisma.commission.findMany({
      where: {
        businessId: boss.businessId,
        month: previous.month,
        year: previous.year,
        status: { not: "CLAWBACK" },
      },
      select: { userId: true, commissionAmt: true },
    });

    const rows = await Promise.all(
      bdes.map(async (bde) => {
        const firstSaleThisMonth = sumByType(bde.bdeCommissions, "FIRST_SALE");
        const renewalThisMonth = sumByType(bde.bdeCommissions, "RENEWAL");
        const slabAmt = slabTotal(bde.bdeCommissions);
        const totalThisMonth =
          firstSaleThisMonth + renewalThisMonth + slabAmt;
        const lastMonthTotal = previousCommissions
          .filter((item) => item.userId === bde.id)
          .reduce((sum, item) => sum + item.commissionAmt, 0);
        const dealsThisMonth = bde.bdeCommissions.filter(
          (item) => item.type === "FIRST_SALE",
        ).length;
        const slab = await getCurrentSlab(
          bde.id,
          current.month,
          current.year,
        );

        return {
          id: bde.id,
          name: bde.name,
          email: bde.email,
          dealsThisMonth,
          firstSaleThisMonth,
          renewalThisMonth,
          slabThisMonth: slab.name === "NONE" ? "No slab" : slab.name,
          totalThisMonth,
          targetProgress: (totalThisMonth / MONTHLY_TARGET) * 100,
          payingCustomers: bde.customerPortfolio.filter(
            (item) => item.status === "PAYING",
          ).length,
          trialCustomers: bde.customerPortfolio.filter(
            (item) => item.status === "TRIAL",
          ).length,
          churnRiskCustomers: bde.customerPortfolio.filter(
            (item) => item.status === "OVERDUE",
          ).length,
          lastActivityAt: latestDate(
            bde.activityLogs[0]?.createdAt,
            bde.leadActivities[0]?.createdAt,
            bde.callLogs[0]?.createdAt,
            bde.updatedAt,
          ),
          trend:
            totalThisMonth > lastMonthTotal
              ? "up"
              : totalThisMonth < lastMonthTotal
                ? "down"
                : "same",
        };
      }),
    );

    const sorted = rows.sort((a, b) => b.totalThisMonth - a.totalThisMonth);
    const totalCommissionOwed = sorted.reduce(
      (sum, item) => sum + item.totalThisMonth,
      0,
    );

    return NextResponse.json({
      bdes: sorted,
      teamSummary: {
        totalDealsThisMonth: sorted.reduce(
          (sum, item) => sum + item.dealsThisMonth,
          0,
        ),
        totalMRRGenerated: sorted.reduce(
          (sum, item) => sum + item.renewalThisMonth,
          0,
        ),
        totalCommissionOwed,
        topPerformer: sorted[0]?.name ?? "No BDEs yet",
        teamTargetProgress:
          sorted.length > 0
            ? sorted.reduce((sum, item) => sum + item.targetProgress, 0) /
              sorted.length
            : 0,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch BDE commission performance." },
      { status: 500 },
    );
  }
}
