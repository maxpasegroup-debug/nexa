import { NextResponse } from "next/server";

import { BLIZZWAY_ADMIN_MODEL, requireBlizzwayAdmin } from "@/lib/blizzway-admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireBlizzwayAdmin();
    if ("error" in auth) return auth.error;

    const [
      totalUsers,
      walletCredits,
      spentCredits,
      totalCompanions,
      activeCompanions,
      assessmentsCount,
      admissionsCount,
      customRequests,
      payments,
      recentLedger,
      recentRequests,
      recentRuns,
    ] = await Promise.all([
      prisma.user.count({ where: { business: { type: { in: [BLIZZWAY_ADMIN_MODEL, "career7"] } }, deletedAt: null } }),
      prisma.career7CreditLedger.aggregate({
        where: { businessModel: BLIZZWAY_ADMIN_MODEL, amount: { gt: 0 } },
        _sum: { amount: true },
      }),
      prisma.career7CreditLedger.aggregate({
        where: { businessModel: BLIZZWAY_ADMIN_MODEL, amount: { lt: 0 } },
        _sum: { amount: true },
      }),
      prisma.marketplaceAgent.count({ where: { businessModel: BLIZZWAY_ADMIN_MODEL, career7Type: { not: null } } }),
      prisma.marketplaceAgent.count({ where: { businessModel: BLIZZWAY_ADMIN_MODEL, career7Type: { not: null }, isActive: true, career7Status: "ACTIVE" } }),
      prisma.blizzwayAssessmentDefinition.count({ where: { businessModel: BLIZZWAY_ADMIN_MODEL } }),
      prisma.blizzwayAdmissionPathwayDefinition.count({ where: { businessModel: BLIZZWAY_ADMIN_MODEL } }),
      prisma.blizzwayCompanionRequest.count({ where: { businessModel: BLIZZWAY_ADMIN_MODEL } }),
      prisma.bgosPaymentIntent.groupBy({
        by: ["status"],
        where: { businessModel: BLIZZWAY_ADMIN_MODEL },
        _count: { _all: true },
        _sum: { amount: true, credits: true },
      }),
      prisma.career7CreditLedger.findMany({
        where: { businessModel: BLIZZWAY_ADMIN_MODEL },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, amount: true, description: true, createdAt: true, user: { select: { name: true, email: true } } },
      }),
      prisma.blizzwayCompanionRequest.findMany({
        where: { businessModel: BLIZZWAY_ADMIN_MODEL },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: { id: true, title: true, status: true, createdAt: true },
      }),
      prisma.blizzwayCompanionRun.findMany({
        where: { businessModel: BLIZZWAY_ADMIN_MODEL },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: { id: true, status: true, createdAt: true, companion: { select: { name: true, slug: true } } },
      }),
    ]);

    return NextResponse.json({
      overview: {
        totalUsers,
        activeUsersPlaceholder: totalUsers,
        walletCreditsIssued: walletCredits._sum.amount ?? 0,
        creditsSpent: Math.abs(spentCredits._sum.amount ?? 0),
        totalCompanions,
        activeCompanions,
        assessmentsCount,
        admissionsPathwaysCount: admissionsCount,
        customCompanionRequests: customRequests,
        paymentSummary: payments.map((item) => ({
          status: item.status,
          count: item._count._all,
          amount: item._sum.amount ?? 0,
          credits: item._sum.credits ?? 0,
        })),
        recentActivity: [
          ...recentLedger.map((item) => ({
            type: "wallet",
            label: item.description,
            detail: `${item.amount} credits · ${item.user?.email ?? "unknown user"}`,
            createdAt: item.createdAt,
          })),
          ...recentRequests.map((item) => ({
            type: "request",
            label: item.title,
            detail: item.status.toLowerCase(),
            createdAt: item.createdAt,
          })),
          ...recentRuns.map((item) => ({
            type: "run",
            label: item.companion.name,
            detail: item.status.toLowerCase(),
            createdAt: item.createdAt,
          })),
        ]
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 10),
      },
    });
  } catch (error) {
    console.error("[internal:blizzway:overview]", error);
    return NextResponse.json({ error: "Unable to load Blizzway admin overview." }, { status: 500 });
  }
}
