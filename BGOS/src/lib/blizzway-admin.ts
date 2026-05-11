import type { AgentCategory, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { BLIZZWAY_BUSINESS_MODEL, topUpCareer7Credits } from "@/lib/career7-wallet";
import { requireInternalOwnerApi } from "@/lib/internal-owner";
import {
  getAgentType,
  getBool,
  getCareer7AgentType,
  getCareer7MarketplaceStatus,
  getNumber,
  getString,
  isAgentCategory,
} from "@/lib/marketplace";
import { prisma } from "@/lib/prisma";

export const BLIZZWAY_ADMIN_MODEL = BLIZZWAY_BUSINESS_MODEL;

export async function requireBlizzwayAdmin() {
  return requireInternalOwnerApi();
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

export function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

export function jsonObject(value: unknown): Prisma.InputJsonValue {
  return value && typeof value === "object" ? (value as Prisma.InputJsonValue) : {};
}

export function slugFrom(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function readCompanionData(body: Record<string, unknown>) {
  const name = getString(body.name);
  const slug = getString(body.slug) || slugFrom(name);
  const category = getString(body.companionCategory) || getString(body.category) || "Career Growth";
  const creditPrice = Math.max(0, Math.round(getNumber(body.creditPrice) ?? 0));
  const pricingMode = getString(body.pricingMode) || (creditPrice > 0 ? "credits" : "free");
  const description = getString(body.description) || `${name} helps Blizzway users complete one focused pathway action.`;

  if (!name || !slug) return { error: "name and slug are required." } as const;

  const marketplaceCategory = (
    isAgentCategory(getString(body.marketplaceCategory) || getString(body.agentCategory))
      ? (getString(body.marketplaceCategory) || getString(body.agentCategory))
      : "EDUCATION"
  ) as AgentCategory;

  return {
    data: {
      businessModel: BLIZZWAY_ADMIN_MODEL,
      businessId: getString(body.businessId) || null,
      slug,
      name,
      tagline: getString(body.tagline) || description.slice(0, 90),
      description,
      shortDescription: getString(body.shortDescription) || description,
      longDescription: getString(body.longDescription) || description,
      category: marketplaceCategory,
      type: getAgentType(body.type ?? body.agentType) ?? "BACKGROUND",
      career7Type: getCareer7AgentType(body.career7Type) ?? "CAREER",
      companionCategory: category,
      creditPrice,
      pricingMode,
      chargeOn: getString(body.chargeOn) || "run",
      icon: getString(body.icon) || "NEXA",
      colorPrimary: getString(body.colorPrimary) || "#7C6FFF",
      colorSecondary: getString(body.colorSecondary) || "#22D9A0",
      gradient: getString(body.gradient) || "linear-gradient(135deg,#312e81,#0891b2)",
      onboardingFee: getNumber(body.onboardingFee) ?? 0,
      monthlyFee: getNumber(body.monthlyFee) ?? 0,
      isActive: getBool(body.isActive) ?? true,
      isFeatured: getBool(body.isFeatured) ?? false,
      isTrending: getBool(body.isTrending) ?? false,
      isPrebuilt: getBool(body.isPrebuilt) ?? false,
      isRequestable: getBool(body.isRequestable) ?? true,
      canAddToGrowthBoard: getBool(body.canAddToGrowthBoard) ?? true,
      sortOrder: getNumber(body.sortOrder) ?? 100,
      career7Status: getCareer7MarketplaceStatus(body.career7Status ?? body.status) ?? "ACTIVE",
      capabilities: asStringArray(body.capabilities) as Prisma.InputJsonValue,
      requiredInputs: asStringArray(body.requiredInputs) as Prisma.InputJsonValue,
      expectedOutput: asStringArray(body.expectedOutput) as Prisma.InputJsonValue,
      recommendedFor: asStringArray(body.recommendedFor) as Prisma.InputJsonValue,
      features: asStringArray(body.features) as Prisma.InputJsonValue,
      benefits: body.benefits ?? [],
      howItWorks: body.howItWorks ?? [],
      stats: jsonObject(body.stats),
      metaTitle: getString(body.metaTitle) || undefined,
      metaDesc: getString(body.metaDesc) || undefined,
    } satisfies Prisma.MarketplaceAgentCreateInput,
  } as const;
}

export function readAssessmentData(body: Record<string, unknown>) {
  const title = getString(body.title);
  const slug = getString(body.slug) || slugFrom(title);
  if (!title || !slug) return { error: "title and slug are required." } as const;
  return {
    data: {
      businessModel: BLIZZWAY_ADMIN_MODEL,
      slug,
      title,
      category: getString(body.category) || "Career Tests",
      description: getString(body.description) || `${title} helps improve BDP readiness signals.`,
      purpose: getString(body.purpose) || null,
      creditCost: Math.max(0, Math.round(getNumber(body.creditCost) ?? 0)),
      pricingMode: getString(body.pricingMode) || ((getNumber(body.creditCost) ?? 0) > 0 ? "paid" : "free"),
      repeatable: getBool(body.repeatable) ?? true,
      active: getBool(body.active) ?? true,
      bdpImpactLabel: getString(body.bdpImpactLabel) || "Improves BDP quality",
      questionSet: (Array.isArray(body.questionSet) ? body.questionSet : asStringArray(body.questionSet)) as Prisma.InputJsonValue,
      metadata: jsonObject(body.metadata),
    },
  } as const;
}

export function readAdmissionData(body: Record<string, unknown>) {
  const title = getString(body.title);
  const slug = getString(body.slug) || slugFrom(title);
  if (!title || !slug) return { error: "title and slug are required." } as const;
  return {
    data: {
      businessModel: BLIZZWAY_ADMIN_MODEL,
      slug,
      title,
      countryRegion: getString(body.countryRegion) || getString(body.region) || "Global",
      level: getString(body.level) || "UG",
      deadline: getString(body.deadline) || getString(body.intakeDeadline) || null,
      eligibilitySummary: getString(body.eligibilitySummary) || "Eligibility guidance placeholder for admin review.",
      documents: asStringArray(body.documents) as Prisma.InputJsonValue,
      scholarships: asStringArray(body.scholarships) as Prisma.InputJsonValue,
      recommendedAssessments: asStringArray(body.recommendedAssessments) as Prisma.InputJsonValue,
      recommendedCompanions: asStringArray(body.recommendedCompanions) as Prisma.InputJsonValue,
      active: getBool(body.active) ?? true,
      metadata: jsonObject(body.metadata),
    },
  } as const;
}

export async function manualWalletAdjustment({
  businessId,
  userId,
  amount,
  reason,
  adminId,
}: {
  businessId: string;
  userId: string;
  amount: number;
  reason: string;
  adminId: string;
}) {
  if (!businessId || !userId || !reason) throw new Error("businessId, userId and reason are required.");
  if (amount === 0) throw new Error("amount must not be zero.");

  if (amount > 0) {
    return topUpCareer7Credits({
      businessId,
      userId,
      amount,
      businessModel: BLIZZWAY_ADMIN_MODEL,
      type: "ADJUSTMENT",
      source: "admin_manual_adjustment",
      idempotencyKey: `admin-credit:${businessId}:${userId}:${Date.now()}`,
      description: `Admin credit grant: ${reason}`,
      metadata: { adminId, reason },
    });
  }

  return prisma.$transaction(async (tx) => {
    const wallet = await tx.career7CreditWallet.upsert({
      where: { businessId_userId: { businessId, userId } },
      create: { businessId, userId, balance: 0 },
      update: {},
    });
    const debit = Math.abs(Math.round(amount));
    if (wallet.balance < debit) throw new Error("Insufficient wallet balance for reversal.");
    const updatedWallet = await tx.career7CreditWallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: debit } },
    });
    const ledger = await tx.career7CreditLedger.create({
      data: {
        businessModel: BLIZZWAY_ADMIN_MODEL,
        businessId,
        userId,
        walletId: wallet.id,
        type: "ADJUSTMENT",
        amount: -debit,
        balanceAfter: updatedWallet.balance,
        source: "admin_manual_adjustment",
        description: `Admin credit reversal: ${reason}`,
        metadata: { adminId, reason },
      },
    });
    return { wallet: updatedWallet, ledger };
  });
}
