import { NextResponse } from "next/server";

import { customerSummary, getCustomerRows, startOfMonth } from "@/lib/internal-control";
import { requireInternalOwnerApi } from "@/lib/internal-owner";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const context = await requireInternalOwnerApi();
  if ("error" in context) return context.error;

  const now = new Date();
  const monthStart = startOfMonth(now);
  const rows = await getCustomerRows(context.business.id, new URL(request.url).searchParams);
  const summary = customerSummary(rows);

  const [
    totalUsers,
    activeUsers,
    archivedUsers,
    bdmCount,
    sdeCount,
    bossCount,
    openSupport,
    criticalSupport,
    onboardingPending,
    onboardingBuilding,
    onboardingReady,
    deliveredThisMonth,
    failedPayments,
    renewalFailed,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { active: true } }),
    prisma.user.count({ where: { OR: [{ active: false }, { status: "ARCHIVED" }] } }),
    prisma.user.count({ where: { role: "BDM" } }),
    prisma.user.count({ where: { role: "SDE" } }),
    prisma.user.count({ where: { role: "BOSS" } }),
    prisma.bug.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.bug.count({ where: { severity: "CRITICAL", status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.onboardingSession.count({ where: { status: { in: ["COLLECTING", "READY", "SUBMITTED"] } } }),
    prisma.onboardingSession.count({ where: { status: "SDE_BUILDING" } }),
    prisma.onboardingSession.count({ where: { status: "SDE_APPROVED" } }),
    prisma.workspaceConfig.count({ where: { deliveredAt: { gte: monthStart } } }),
    prisma.business.count({ where: { status: "RENEWAL_FAILED" } }),
    prisma.business.count({ where: { status: "RENEWAL_FAILED" } }),
  ]);

  const newMRRThisMonth = rows
    .filter((row) => row.joinedAt >= monthStart)
    .reduce((sum, row) => sum + row.mrr, 0);

  return NextResponse.json({
    customers: {
      total: summary.total,
      active: summary.active,
      trial: summary.trial,
      suspended: summary.suspended,
      offboarded: 0,
      renewalFailed,
      newThisMonth: rows.filter((row) => row.joinedAt >= monthStart).length,
    },
    users: {
      total: totalUsers,
      active: activeUsers,
      archived: archivedUsers,
      byRole: { BDM: bdmCount, SDE: sdeCount, BOSS: bossCount },
    },
    revenue: {
      mrr: summary.totalMRR,
      arr: summary.totalMRR * 12,
      newMRRThisMonth,
      churnedMRRThisMonth: 0,
      growth: summary.totalMRR ? Math.round((newMRRThisMonth / summary.totalMRR) * 100) : 0,
    },
    health: {
      avgScore: summary.avgHealthScore,
      atRisk: summary.atRisk,
      noLoginWeek: rows.filter((row) => row.daysSinceLastLogin >= 7).length,
      noLoginTwoWeeks: rows.filter((row) => row.daysSinceLastLogin >= 14).length,
    },
    support: { open: openSupport, critical: criticalSupport, avgResolutionHours: 0 },
    ratings: { average: null, total: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
    onboarding: {
      pending: onboardingPending,
      building: onboardingBuilding,
      readyToDeliver: onboardingReady,
      deliveredThisMonth,
    },
    payments: {
      failed: failedPayments,
      upcoming7days: rows.filter((row) => row.daysUntilTrialExpiry !== null && row.daysUntilTrialExpiry <= 7).length,
      totalCollectedThisMonth: summary.totalMRR,
    },
  });
}
