import { redirect } from "next/navigation";

import { BdeCommissionDashboard } from "@/components/bde/bde-commission-dashboard";
import auth from "@/lib/auth";
import {
  calcMonthlyEarnings,
  calcRenewal,
  getCurrentSlab,
  getNextMilestone,
  projectMonthEnd,
} from "@/lib/commission";
import { monthBounds } from "@/lib/commission-context";
import { prisma } from "@/lib/prisma";

const MONTHLY_TARGET = 30000;

function serialize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function recentMonths(count: number) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  });

  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - index, 1);
    return {
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      label: formatter.format(date),
    };
  });
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function sumCommission(
  rows: Array<{ userId: string; commissionAmt: number }>,
  userId: string,
) {
  return rows
    .filter((row) => row.userId === userId)
    .reduce((sum, row) => sum + row.commissionAmt, 0);
}

export default async function BdmCommissionPage() {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      role: true,
      businessId: true,
      business: { select: { name: true } },
    },
  });

  if (!user?.businessId || !user.business) redirect("/onboarding");

  const now = new Date();
  const current = monthBounds(now);
  const previous = monthBounds(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const totalDays = new Date(current.year, current.month, 0).getDate();
  const daysElapsed = now.getDate();
  const daysRemaining = Math.max(0, totalDays - daysElapsed);
  const churnedSince = daysAgo(30);
  const months = recentMonths(6);

  const [
    earnings,
    currentSlab,
    dealsThisMonth,
    commissions,
    portfolioRows,
    bdes,
    currentCommissions,
    previousCommissions,
    payoutRecords,
    slabAchievement,
  ] = await Promise.all([
    calcMonthlyEarnings(user.id, current.month, current.year),
    getCurrentSlab(user.id, current.month, current.year),
    prisma.commission.count({
      where: {
        userId: user.id,
        month: current.month,
        year: current.year,
        type: "FIRST_SALE",
        status: { not: "CLAWBACK" },
      },
    }),
    prisma.commission.findMany({
      where: {
        userId: user.id,
        month: current.month,
        year: current.year,
      },
      orderBy: { createdAt: "desc" },
      include: {
        lead: { select: { id: true, name: true, phone: true, company: true, leadType: true } },
      },
    }),
    prisma.customerPortfolio.findMany({
      where: {
        userId: user.id,
        OR: [
          { status: { in: ["PAYING", "TRIAL", "OVERDUE"] } },
          { status: "CHURNED", updatedAt: { gte: churnedSince } },
        ],
      },
      include: {
        lead: { select: { id: true, name: true, phone: true, company: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.user.findMany({
      where: { businessId: user.businessId, role: "BDM" },
      select: { id: true, name: true },
    }),
    prisma.commission.findMany({
      where: {
        businessId: user.businessId,
        month: current.month,
        year: current.year,
        status: { not: "CLAWBACK" },
      },
      select: { userId: true, type: true, commissionAmt: true },
    }),
    prisma.commission.findMany({
      where: {
        businessId: user.businessId,
        month: previous.month,
        year: previous.year,
        status: { not: "CLAWBACK" },
      },
      select: { userId: true, commissionAmt: true },
    }),
    prisma.payoutHistory.findMany({
      where: {
        userId: user.id,
        OR: months.map((item) => ({ month: item.month, year: item.year })),
      },
    }),
    prisma.slabAchievement.findFirst({
      where: { userId: user.id, notified: false },
      orderBy: { achievedAt: "desc" },
      select: { id: true, slabName: true, bonusAmt: true },
    }),
  ]);

  const paying = portfolioRows.filter((item) => item.status === "PAYING");
  const trial = portfolioRows.filter((item) => item.status === "TRIAL");
  const overdue = portfolioRows.filter((item) => item.status === "OVERDUE");
  const churned = portfolioRows.filter((item) => item.status === "CHURNED");

  const ranked = bdes
    .map((bde) => {
      const totalThisMonth = sumCommission(currentCommissions, bde.id);
      const lastMonth = sumCommission(previousCommissions, bde.id);
      const bdeDeals = currentCommissions.filter(
        (row) => row.userId === bde.id && row.type === "FIRST_SALE",
      ).length;

      return {
        userId: bde.id,
        name: bde.name,
        dealsThisMonth: bdeDeals,
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

  const visibleLeaderboard = ranked.slice(0, 6);
  const currentUserRank = ranked.find((item) => item.userId === user.id);
  const initialLeaderboard =
    currentUserRank &&
    !visibleLeaderboard.some((item) => item.userId === user.id)
      ? [...visibleLeaderboard.slice(0, 5), currentUserRank]
      : visibleLeaderboard;
  const firstSaleRows = commissions.filter((item) => item.type === "FIRST_SALE");
  const leadTypeBreakdown = {
    platform: {
      closed: firstSaleRows.filter((item) => item.lead?.leadType === "PLATFORM").length,
      amount: firstSaleRows
        .filter((item) => item.lead?.leadType === "PLATFORM")
        .reduce((sum, item) => sum + item.commissionAmt, 0),
      base: firstSaleRows
        .filter((item) => item.lead?.leadType === "PLATFORM")
        .reduce((sum, item) => sum + item.baseCommission, 0),
    },
    management: {
      closed: firstSaleRows.filter((item) => item.lead?.leadType === "MANAGEMENT").length,
      amount: firstSaleRows
        .filter((item) => item.lead?.leadType === "MANAGEMENT")
        .reduce((sum, item) => sum + item.commissionAmt, 0),
      base: firstSaleRows
        .filter((item) => item.lead?.leadType === "MANAGEMENT")
        .reduce((sum, item) => sum + item.baseCommission, 0),
    },
    self: {
      closed: firstSaleRows.filter((item) => item.lead?.leadType === "SELF").length,
      amount: firstSaleRows
        .filter((item) => item.lead?.leadType === "SELF")
        .reduce((sum, item) => sum + item.commissionAmt, 0),
      base: firstSaleRows
        .filter((item) => item.lead?.leadType === "SELF")
        .reduce((sum, item) => sum + item.baseCommission, 0),
    },
  };

  return (
    <BdeCommissionDashboard
      user={{
        id: user.id,
        name: user.name,
        role: user.role,
        businessId: user.businessId,
        businessName: user.business.name,
      }}
      initialCommission={serialize({
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
        leadTypeBreakdown,
        commissions,
      })}
      initialPortfolio={serialize({
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
      })}
      initialLeaderboard={serialize(initialLeaderboard)}
      initialHistory={serialize(
        months.map((item) => {
          const record = payoutRecords.find(
            (entry) => entry.month === item.month && entry.year === item.year,
          );
          return {
            month: item.month,
            year: item.year,
            label: item.label,
            firstSale: record?.firstSale ?? 0,
            renewal: record?.renewal ?? 0,
            slabBonus: record?.slabBonus ?? 0,
            total: record?.total ?? 0,
            status: record?.status ?? "pending",
          };
        }),
      )}
      slabAchievement={serialize(slabAchievement)}
    />
  );
}
