import type { Prisma } from "@prisma/client";

import { BLIZZWAY_BUSINESS_MODEL } from "@/lib/career7-wallet";
import { prisma } from "@/lib/prisma";

export const BLIZZWAY_WELCOME_CREDITS = 500;
export const BLIZZWAY_FREE_MONTHLY_CREDITS = 100;

export const BLIZZWAY_CREDIT_PACKAGES = [
  {
    slug: "starter",
    name: "Starter",
    description: "A focused refill for assessments, quick boosts, and starter guidance.",
    priceInr: 499,
    baseCredits: 500,
    bonusCredits: 0,
    totalCredits: 500,
    badgeLabel: null,
    sortOrder: 10,
  },
  {
    slug: "growth",
    name: "Growth",
    description: "Best value for steady pathway progress and companion usage.",
    priceInr: 999,
    baseCredits: 1000,
    bonusCredits: 200,
    totalCredits: 1200,
    badgeLabel: "Best Value",
    sortOrder: 20,
  },
  {
    slug: "pro",
    name: "Pro",
    description: "A larger bundle for BDP, admissions, and premium service preparation.",
    priceInr: 2499,
    baseCredits: 2500,
    bonusCredits: 1000,
    totalCredits: 3500,
    badgeLabel: null,
    sortOrder: 30,
  },
  {
    slug: "elite",
    name: "Elite",
    description: "High-volume credits for deep transformation and companion-heavy work.",
    priceInr: 4999,
    baseCredits: 5000,
    bonusCredits: 3000,
    totalCredits: 8000,
    badgeLabel: "Most Popular",
    sortOrder: 40,
  },
  {
    slug: "visionary",
    name: "Visionary",
    description: "Maximum runway for premium pathway support and ambitious career moves.",
    priceInr: 9999,
    baseCredits: 10000,
    bonusCredits: 8000,
    totalCredits: 18000,
    badgeLabel: null,
    sortOrder: 50,
  },
] as const;

export const BLIZZWAY_SUBSCRIPTION_PLANS = [
  {
    slug: "free-explorer",
    name: "Free Explorer",
    monthlyPriceInr: 0,
    monthlyCredits: BLIZZWAY_FREE_MONTHLY_CREDITS,
    features: [
      "500 welcome credits on signup",
      "100 monthly credits",
      "Selected free assessments",
      "BDP starter experience",
    ],
    sortOrder: 10,
  },
  {
    slug: "pro-pathfinder",
    name: "Pro Pathfinder",
    monthlyPriceInr: 1999,
    monthlyCredits: 2000,
    features: [
      "2,000 monthly credits",
      "Expanded assessments",
      "BDP growth tools",
      "Priority NEXA recommendations",
    ],
    sortOrder: 20,
  },
  {
    slug: "elite-transformation",
    name: "Elite Transformation",
    monthlyPriceInr: 4999,
    monthlyCredits: 10000,
    features: [
      "10,000 monthly credits",
      "Advanced companion usage",
      "Premium pathway services",
      "Admissions and earning acceleration",
    ],
    sortOrder: 30,
  },
  {
    slug: "guardian-concierge",
    name: "Guardian Concierge",
    monthlyPriceInr: 24999,
    monthlyCredits: 0,
    features: [
      "Custom monthly credit allocation",
      "Concierge career pathway support",
      "Premium service coordination",
      "Dedicated success workflow",
    ],
    sortOrder: 40,
  },
] as const;

export async function ensureBlizzwayPricingCatalog() {
  await prisma.$transaction([
    ...BLIZZWAY_CREDIT_PACKAGES.map((item) =>
      prisma.blizzwayCreditPackage.upsert({
        where: {
          businessModel_slug: {
            businessModel: BLIZZWAY_BUSINESS_MODEL,
            slug: item.slug,
          },
        },
        create: {
          businessModel: BLIZZWAY_BUSINESS_MODEL,
          ...item,
          metadata: {} as Prisma.InputJsonValue,
        },
        update: {
          name: item.name,
          description: item.description,
          priceInr: item.priceInr,
          baseCredits: item.baseCredits,
          bonusCredits: item.bonusCredits,
          totalCredits: item.totalCredits,
          badgeLabel: item.badgeLabel,
          active: true,
          sortOrder: item.sortOrder,
        },
      }),
    ),
    ...BLIZZWAY_SUBSCRIPTION_PLANS.map((item) =>
      prisma.blizzwaySubscriptionPlan.upsert({
        where: {
          businessModel_slug: {
            businessModel: BLIZZWAY_BUSINESS_MODEL,
            slug: item.slug,
          },
        },
        create: {
          businessModel: BLIZZWAY_BUSINESS_MODEL,
          ...item,
          features: [...item.features] as Prisma.InputJsonValue,
          metadata: {} as Prisma.InputJsonValue,
        },
        update: {
          name: item.name,
          monthlyPriceInr: item.monthlyPriceInr,
          monthlyCredits: item.monthlyCredits,
          features: [...item.features] as Prisma.InputJsonValue,
          active: true,
          sortOrder: item.sortOrder,
        },
      }),
    ),
  ]);
}

export async function listBlizzwayCreditPackages() {
  await ensureBlizzwayPricingCatalog();

  return prisma.blizzwayCreditPackage.findMany({
    where: { businessModel: BLIZZWAY_BUSINESS_MODEL, active: true },
    orderBy: [{ sortOrder: "asc" }, { priceInr: "asc" }],
  });
}

export async function listBlizzwaySubscriptionPlans() {
  await ensureBlizzwayPricingCatalog();

  return prisma.blizzwaySubscriptionPlan.findMany({
    where: { businessModel: BLIZZWAY_BUSINESS_MODEL, active: true },
    orderBy: [{ sortOrder: "asc" }, { monthlyPriceInr: "asc" }],
  });
}

export async function getBlizzwayCreditPackage(packageIdOrSlug: string) {
  await ensureBlizzwayPricingCatalog();

  return prisma.blizzwayCreditPackage.findFirst({
    where: {
      businessModel: BLIZZWAY_BUSINESS_MODEL,
      active: true,
      OR: [{ id: packageIdOrSlug }, { slug: packageIdOrSlug }],
    },
  });
}
