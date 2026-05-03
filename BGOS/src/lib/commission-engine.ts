import type { Commission, CommissionType } from "@prisma/client";

import { prisma } from "./prisma";

export const PLAN_COMMISSION_RATES: Record<string, { firstSale: number; renewal: number }> = {
  STARTER: { firstSale: 400, renewal: 150 },
  GROWTH: { firstSale: 1500, renewal: 500 },
  SCALE: { firstSale: 3500, renewal: 1000 },
  ENTERPRISE: { firstSale: 7000, renewal: 2000 },
};

export const AGENT_COMMISSION_RATES: Record<string, { firstSale: number; renewal: number }> = {
  "sales-booster": { firstSale: 750, renewal: 300 },
  wazzup: { firstSale: 500, renewal: 200 },
  taxmate: { firstSale: 400, renewal: 160 },
  peopledesk: { firstSale: 400, renewal: 160 },
  sitesync: { firstSale: 750, renewal: 300 },
  careloop: { firstSale: 650, renewal: 260 },
  eduflow: { firstSale: 500, renewal: 200 },
  classmate: { firstSale: 650, renewal: 260 },
  proppilot: { firstSale: 650, renewal: 260 },
  stocksense: { firstSale: 500, renewal: 200 },
};

export const SLAB_THRESHOLDS = [
  { name: "DIAMOND", min: 30000, bonus: 20000 },
  { name: "GOLD", min: 22500, bonus: 12000 },
  { name: "SILVER", min: 15000, bonus: 7000 },
  { name: "BRONZE", min: 7500, bonus: 3000 },
  { name: "NONE", min: 0, bonus: 0 },
];

export const RENEWAL_CAP_MONTHS = 24;

function nowParts() {
  const now = new Date();
  return { now, month: now.getMonth() + 1, year: now.getFullYear() };
}

async function getBusinessWithBDM(businessId: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      trialSubscription: true,
      onboardingLead: { select: { assignedBDMId: true } },
      leads: { select: { assignedTo: true, createdBy: true }, take: 1 },
      commissions: {
        where: { type: { in: ["PLAN_RENEWAL", "RENEWAL"] } },
        select: { id: true },
      },
    },
  });

  if (!business) return null;

  return {
    ...business,
    resolvedBdmId:
      business.bdmId ??
      business.onboardingLead?.assignedBDMId ??
      business.leads[0]?.assignedTo ??
      business.leads[0]?.createdBy ??
      null,
    resolvedPlan: (business.plan ?? business.trialSubscription?.plan ?? "STARTER").toUpperCase(),
  };
}

async function createCommissionRecord(data: {
  userId: string;
  businessId: string;
  type: CommissionType;
  amount: number;
  baseAmount?: number;
  multiplier?: number;
  razorpayPaymentId?: string;
  paymentSource?: string;
  agentSlug?: string;
  renewalMonth?: number;
  notes?: string;
  planType?: string;
}) {
  const { now, month, year } = nowParts();
  const baseAmount = data.baseAmount ?? data.amount;
  const multiplier = data.multiplier ?? 1;

  return prisma.commission.create({
    data: {
      userId: data.userId,
      businessId: data.businessId,
      type: data.type,
      amount: data.amount,
      commissionAmt: data.amount,
      baseAmount,
      baseCommission: baseAmount,
      multiplier,
      razorpayPaymentId: data.razorpayPaymentId,
      paymentSource: data.paymentSource,
      agentSlug: data.agentSlug,
      billingMonth: month,
      billingYear: year,
      month,
      year,
      renewalMonth: data.renewalMonth ?? 1,
      status: "EARNED",
      notes: data.notes,
      planType: data.planType ?? "STARTER",
      createdAt: now,
    },
  });
}

export async function createPlanCommission({
  businessId,
  razorpayPaymentId,
  isFirstPayment,
}: {
  businessId: string;
  razorpayPaymentId: string;
  isFirstPayment: boolean;
}): Promise<void> {
  const existing = await prisma.commission.findFirst({
    where: { razorpayPaymentId, paymentSource: "PLAN_SUBSCRIPTION" },
    select: { id: true },
  });
  if (existing) return;

  const business = await getBusinessWithBDM(businessId);
  if (!business?.resolvedBdmId) return;

  const rates = PLAN_COMMISSION_RATES[business.resolvedPlan];
  if (!rates) return;

  const renewalCount = business.commissions.length;
  if (!isFirstPayment && renewalCount >= RENEWAL_CAP_MONTHS) return;

  const type: CommissionType = isFirstPayment ? "PLAN_FIRST_SALE" : "PLAN_RENEWAL";
  const amount = isFirstPayment ? rates.firstSale : rates.renewal;
  const now = new Date();

  const commission = await createCommissionRecord({
    userId: business.resolvedBdmId,
    businessId,
    type,
    amount,
    razorpayPaymentId,
    paymentSource: "PLAN_SUBSCRIPTION",
    renewalMonth: isFirstPayment ? 1 : renewalCount + 1,
    planType: business.resolvedPlan,
  });

  if (isFirstPayment) {
    await prisma.business.update({
      where: { id: businessId },
      data: {
        firstPaymentAt: business.firstPaymentAt ?? now,
        lastPaymentAt: now,
        status: "ACTIVE",
        bdmId: business.bdmId ?? business.resolvedBdmId,
      },
    });
  }

  await checkAndCreateSlabBonus(business.resolvedBdmId);
  await updateWallet(business.resolvedBdmId);
  await notifyBDM(business.resolvedBdmId, commission, businessId);
}

export async function createAgentCommission({
  businessId,
  agentSlug,
  razorpayPaymentId,
  isFirstPayment,
}: {
  businessId: string;
  agentSlug: string;
  razorpayPaymentId: string;
  isFirstPayment: boolean;
}): Promise<void> {
  const existing = await prisma.commission.findFirst({
    where: { razorpayPaymentId, paymentSource: "AGENT_SUBSCRIPTION", agentSlug },
    select: { id: true },
  });
  if (existing) return;

  const business = await getBusinessWithBDM(businessId);
  if (!business?.resolvedBdmId) return;

  const rates = AGENT_COMMISSION_RATES[agentSlug];
  if (!rates) return;

  const type: CommissionType = isFirstPayment ? "AGENT_FIRST_SALE" : "AGENT_RENEWAL";
  const amount = isFirstPayment ? rates.firstSale : rates.renewal;

  const commission = await createCommissionRecord({
    userId: business.resolvedBdmId,
    businessId,
    agentSlug,
    type,
    amount,
    razorpayPaymentId,
    paymentSource: "AGENT_SUBSCRIPTION",
    notes: agentSlug,
  });

  await checkAndCreateSlabBonus(business.resolvedBdmId);
  await updateWallet(business.resolvedBdmId);
  await notifyBDM(business.resolvedBdmId, commission, businessId);
}

export async function updateWallet(userId: string): Promise<void> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [earnedAllTime, paidOut, thisMonth] = await Promise.all([
    prisma.commission.findMany({
      where: { userId, status: { in: ["EARNED", "PAID_OUT", "PENDING", "PAID"] } },
    }),
    prisma.commission.findMany({
      where: { userId, status: { in: ["PAID_OUT", "PAID"] } },
    }),
    prisma.commission.findMany({
      where: {
        userId,
        status: { in: ["EARNED", "PENDING"] },
        createdAt: { gte: monthStart, lt: monthEnd },
      },
    }),
  ]);

  const value = (commission: Commission) => commission.amount || commission.commissionAmt || 0;
  const planComm = thisMonth
    .filter((commission) => ["PLAN_FIRST_SALE", "FIRST_SALE"].includes(commission.type))
    .reduce((sum, commission) => sum + value(commission), 0);
  const agentComm = thisMonth
    .filter((commission) => commission.type === "AGENT_FIRST_SALE")
    .reduce((sum, commission) => sum + value(commission), 0);
  const renewals = thisMonth
    .filter((commission) => ["PLAN_RENEWAL", "AGENT_RENEWAL", "RENEWAL"].includes(commission.type))
    .reduce((sum, commission) => sum + value(commission), 0);
  const slabBonus = thisMonth
    .filter((commission) =>
      ["SLAB_BONUS", "SLAB_BRONZE", "SLAB_SILVER", "SLAB_GOLD", "SLAB_DIAMOND"].includes(commission.type),
    )
    .reduce((sum, commission) => sum + value(commission), 0);
  const thisMonthTotal = planComm + agentComm + renewals + slabBonus;
  const currentSlab = SLAB_THRESHOLDS.find((slab) => thisMonthTotal >= slab.min)?.name ?? "NONE";
  const totalEarned = earnedAllTime.reduce((sum, commission) => sum + value(commission), 0);
  const totalPaidOut = paidOut.reduce((sum, commission) => sum + value(commission), 0);

  await prisma.bDMWallet.upsert({
    where: { userId },
    create: {
      userId,
      totalEarned,
      totalPaidOut,
      availableBalance: Math.max(0, totalEarned - totalPaidOut),
      thisMonthEarned: thisMonthTotal,
      thisMonthPlanComm: planComm,
      thisMonthAgentComm: agentComm,
      thisMonthRenewals: renewals,
      thisMonthSlabBonus: slabBonus,
      currentSlab,
      lastUpdatedAt: now,
    },
    update: {
      totalEarned,
      totalPaidOut,
      availableBalance: Math.max(0, totalEarned - totalPaidOut),
      thisMonthEarned: thisMonthTotal,
      thisMonthPlanComm: planComm,
      thisMonthAgentComm: agentComm,
      thisMonthRenewals: renewals,
      thisMonthSlabBonus: slabBonus,
      currentSlab,
      lastUpdatedAt: now,
    },
  });
}

export async function checkAndCreateSlabBonus(userId: string): Promise<void> {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 1);

  const monthCommissions = await prisma.commission.findMany({
    where: {
      userId,
      status: { in: ["EARNED", "PENDING"] },
      createdAt: { gte: monthStart, lt: monthEnd },
      type: { notIn: ["SLAB_BONUS", "SLAB_BRONZE", "SLAB_SILVER", "SLAB_GOLD", "SLAB_DIAMOND"] },
    },
  });
  const commissionTotal = monthCommissions.reduce(
    (sum, commission) => sum + (commission.amount || commission.commissionAmt || 0),
    0,
  );
  const newSlab = SLAB_THRESHOLDS.find((slab) => commissionTotal >= slab.min);
  if (!newSlab || newSlab.name === "NONE" || newSlab.bonus === 0) return;

  const existing = await prisma.commission.findFirst({
    where: {
      userId,
      type: "SLAB_BONUS",
      notes: newSlab.name,
      billingMonth: month,
      billingYear: year,
    },
    select: { id: true },
  });
  if (existing) return;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { businessId: true },
  });
  const businessId = user?.businessId;
  if (!businessId) return;

  const commission = await createCommissionRecord({
    userId,
    businessId,
    type: "SLAB_BONUS",
    amount: newSlab.bonus,
    renewalMonth: 0,
    notes: newSlab.name,
    planType: "SLAB",
  });

  await prisma.nexaInsight.create({
    data: {
      businessId,
      type: "SLAB_CROSSED",
      title: `You crossed ${newSlab.name} slab!`,
      message: `Congratulations! You have earned ₹${newSlab.bonus.toLocaleString("en-IN")} slab bonus this month. Keep going!`,
      content: `Congratulations! You have earned ₹${newSlab.bonus.toLocaleString("en-IN")} slab bonus this month. Keep going!`,
      targetUserId: userId,
      priority: "HIGH",
      action: "View commission",
    },
  });

  await notifyBDM(userId, commission, businessId);
}

async function notifyBDM(userId: string, commission: Commission, businessId: string): Promise<void> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { name: true },
  });

  const typeLabels: Record<string, string> = {
    PLAN_FIRST_SALE: "First payment",
    PLAN_RENEWAL: "Monthly renewal",
    AGENT_FIRST_SALE: "Agent first month",
    AGENT_RENEWAL: "Agent renewal",
    SLAB_BONUS: "Slab bonus",
  };
  const amount = commission.amount || commission.commissionAmt || 0;
  const message = `${business?.name || "A customer"} - ${typeLabels[commission.type] || commission.type}. Added to your wallet.`;

  await prisma.nexaInsight.create({
    data: {
      businessId,
      type: "COMMISSION_EARNED",
      title: `+₹${amount.toLocaleString("en-IN")} earned`,
      message,
      content: message,
      targetUserId: userId,
      priority: "NORMAL",
      action: "View commission",
    },
  });
}
