import type { CommissionType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

// Commission rates
export const COMMISSION_RATES = {
  STARTER: { firstSale: 400, renewal: 150 },
  GROWTH: { firstSale: 1500, renewal: 500 },
  SCALE: { firstSale: 3500, renewal: 1000 },
  ENTERPRISE: { firstSale: 7000, renewal: 2000 },
  ANNUAL_GROWTH: { firstSale: 3000, renewal: 0 },
  ANNUAL_SCALE: { firstSale: 7000, renewal: 0 },
};

// Slab thresholds
export const SLABS = [
  { name: "DIAMOND", minDeals: 11, bonus: 20000, label: "💎 Diamond" },
  { name: "GOLD", minDeals: 8, bonus: 12000, label: "🥇 Gold" },
  { name: "SILVER", minDeals: 5, bonus: 7000, label: "🥈 Silver" },
  { name: "BRONZE", minDeals: 3, bonus: 3000, label: "🥉 Bronze" },
];

// Detect plan type from deal value
export function detectPlanType(value: number): string {
  if (value >= 18000) return "ANNUAL_SCALE";
  if (value >= 6000) return "ANNUAL_GROWTH";
  if (value >= 15000) return "ENTERPRISE";
  if (value >= 5000) return "SCALE";
  if (value >= 1500) return "GROWTH";
  return "STARTER";
}

// Calculate first sale commission
export function calcFirstSale(planType: string): number {
  return (
    COMMISSION_RATES[planType as keyof typeof COMMISSION_RATES]?.firstSale || 0
  );
}

export function calculateFirstSaleCommission(
  planType: string,
  lead: { commissionMultiplier?: number | null },
): { base: number; multiplier: number; final: number } {
  const base = calcFirstSale(planType);
  const multiplier = lead.commissionMultiplier ?? 1;
  return {
    base,
    multiplier,
    final: Math.round(base * multiplier),
  };
}

// Calculate renewal commission
export function calcRenewal(planType: string): number {
  return (
    COMMISSION_RATES[planType as keyof typeof COMMISSION_RATES]?.renewal || 0
  );
}

// Get current slab for a BDE this month
export async function getCurrentSlab(userId: string, month: number, year: number) {
  const deals = await prisma.commission.count({
    where: {
      userId,
      month,
      year,
      type: "FIRST_SALE",
      status: { not: "CLAWBACK" },
    },
  });
  for (const slab of SLABS) {
    if (deals >= slab.minDeals) return { ...slab, deals };
  }
  return { name: "NONE", minDeals: 0, bonus: 0, label: "No slab", deals };
}

// Get next slab milestone
export function getNextMilestone(currentDeals: number): string | null {
  for (const slab of [...SLABS].reverse()) {
    if (currentDeals < slab.minDeals) {
      const needed = slab.minDeals - currentDeals;
      return `Close ${needed} more deal${needed > 1 ? "s" : ""} to unlock ${slab.label} and earn ₹${slab.bonus.toLocaleString("en-IN")} bonus`;
    }
  }
  return null;
}

// Calculate total earned this month
export async function calcMonthlyEarnings(
  userId: string,
  month: number,
  year: number,
) {
  const commissions = await prisma.commission.findMany({
    where: { userId, month, year, status: { not: "CLAWBACK" } },
  });
  const firstSale = commissions
    .filter((c) => c.type === "FIRST_SALE")
    .reduce((s, c) => s + c.commissionAmt, 0);
  const renewal = commissions
    .filter((c) => c.type === "RENEWAL")
    .reduce((s, c) => s + c.commissionAmt, 0);
  const slab = commissions
    .filter((c) =>
      ["SLAB_BRONZE", "SLAB_SILVER", "SLAB_GOLD", "SLAB_DIAMOND"].includes(
        c.type,
      ),
    )
    .reduce((s, c) => s + c.commissionAmt, 0);
  return { firstSale, renewal, slab, total: firstSale + renewal + slab };
}

// Check and award slab - called after every deal close
export async function checkAndAwardSlab(userId: string) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const slab = await getCurrentSlab(userId, month, year);
  if (slab.name === "NONE") return null;

  const existing = await prisma.slabAchievement.findUnique({
    where: { userId_month_year: { userId, month, year } },
  });

  // Already at this slab or higher
  const slabOrder = ["BRONZE", "SILVER", "GOLD", "DIAMOND"];
  const currentIdx = slabOrder.indexOf(slab.name);
  const existingIdx = existing ? slabOrder.indexOf(existing.slabName) : -1;

  if (existingIdx >= currentIdx) return null;

  // New slab achieved - create or update
  const achievement = await prisma.slabAchievement.upsert({
    where: { userId_month_year: { userId, month, year } },
    create: {
      userId,
      month,
      year,
      slabName: slab.name,
      dealsCount: slab.deals,
      bonusAmt: slab.bonus,
      achievedAt: new Date(),
      notified: false,
    },
    update: {
      slabName: slab.name,
      dealsCount: slab.deals,
      bonusAmt: slab.bonus,
      achievedAt: new Date(),
      notified: false,
    },
  });

  // Create commission record for slab
  const typeMap: Record<string, CommissionType> = {
    BRONZE: "SLAB_BRONZE",
    SILVER: "SLAB_SILVER",
    GOLD: "SLAB_GOLD",
    DIAMOND: "SLAB_DIAMOND",
  };
  const slabCommissionTypes: CommissionType[] = [
    "SLAB_BRONZE",
    "SLAB_SILVER",
    "SLAB_GOLD",
    "SLAB_DIAMOND",
  ];

  // Remove old slab commission for this month if upgrading
  await prisma.commission.deleteMany({
    where: {
      userId,
      month,
      year,
      type: { in: slabCommissionTypes },
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { business: true },
  });

  await prisma.commission.create({
    data: {
      userId,
      businessId: user!.businessId!,
      type: typeMap[slab.name],
      planType: "SLAB",
      commissionAmt: slab.bonus,
      status: "PENDING",
      month,
      year,
    },
  });

  return achievement;
}

// Project month-end earnings based on current pace
export function projectMonthEnd(
  currentTotal: number,
  daysElapsed: number,
  totalDays: number,
): number {
  if (daysElapsed === 0) return 0;
  return Math.round((currentTotal / daysElapsed) * totalDays);
}
