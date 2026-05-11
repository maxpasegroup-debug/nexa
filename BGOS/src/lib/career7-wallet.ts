import type { Prisma, PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type Tx = Prisma.TransactionClient;

export const BLIZZWAY_BUSINESS_MODEL = "blizzway";
export const CAREER7_BUSINESS_MODEL = "career7";
export const BLIZZWAY_BUSINESS_MODEL_ALIASES = [
  BLIZZWAY_BUSINESS_MODEL,
  CAREER7_BUSINESS_MODEL,
] as const;

export type BlizzwayBusinessModel = (typeof BLIZZWAY_BUSINESS_MODEL_ALIASES)[number];

export function normalizeBlizzwayBusinessModel(value: unknown): BlizzwayBusinessModel | null {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  return BLIZZWAY_BUSINESS_MODEL_ALIASES.includes(normalized as BlizzwayBusinessModel)
    ? (normalized as BlizzwayBusinessModel)
    : null;
}

export function isCareer7PaymentModeEnabled() {
  return process.env.CAREER7_CREDIT_PAYMENT_ENABLED !== "false";
}

export async function ensureCareer7Wallet(
  businessId: string,
  userId: string,
  client: PrismaClient | Tx = prisma,
) {
  return client.career7CreditWallet.upsert({
    where: { businessId_userId: { businessId, userId } },
    create: { businessId, userId, balance: 0 },
    update: {},
  });
}

export async function topUpCareer7Credits({
  businessId,
  userId,
  amount,
  businessModel = CAREER7_BUSINESS_MODEL,
  description = "Blizzway credit top-up",
  source = "top_up",
  idempotencyKey,
  type = "TOP_UP",
  metadata = {},
}: {
  businessId: string;
  userId: string;
  amount: number;
  businessModel?: BlizzwayBusinessModel;
  description?: string;
  source?: string;
  idempotencyKey?: string;
  type?: "TOP_UP" | "ADJUSTMENT" | "REWARD" | "MONTHLY_GRANT";
  metadata?: Prisma.InputJsonValue;
}) {
  const credits = Math.max(0, Math.round(amount));
  if (credits <= 0) {
    throw new Error("Top-up amount must be greater than zero.");
  }

  return prisma.$transaction(async (tx) => {
    if (idempotencyKey) {
      const existingLedger = await tx.career7CreditLedger.findUnique({
        where: { idempotencyKey },
      });

      if (existingLedger) {
        const wallet = await ensureCareer7Wallet(businessId, userId, tx);
        return { wallet, ledger: existingLedger };
      }
    }

    await ensureCareer7Wallet(businessId, userId, tx);

    const wallet = await tx.career7CreditWallet.update({
      where: { businessId_userId: { businessId, userId } },
      data: { balance: { increment: credits } },
    });

    const ledger = await tx.career7CreditLedger.create({
      data: {
        businessModel,
        businessId,
        userId,
        walletId: wallet.id,
        type,
        amount: credits,
        balanceAfter: wallet.balance,
        source,
        idempotencyKey,
        description,
        metadata,
      },
    });

    return { wallet, ledger };
  });
}

export async function grantBlizzwaySignupWelcomeCredits({
  businessId,
  userId,
}: {
  businessId: string;
  userId: string;
}) {
  return topUpCareer7Credits({
    businessId,
    userId,
    amount: 500,
    businessModel: BLIZZWAY_BUSINESS_MODEL,
    type: "REWARD",
    source: "signup_welcome",
    idempotencyKey: `blizzway:signup-welcome:${businessId}:${userId}`,
    description: "Welcome credits for joining Blizzway",
    metadata: {
      reward: "SIGNUP_WELCOME",
      credits: 500,
    },
  });
}

export const BLIZZWAY_ACHIEVEMENT_REWARDS = {
  first_assessment: {
    credits: 25,
    description: "Achievement reward: complete first assessment",
  },
  publish_bdp: {
    credits: 50,
    description: "Achievement reward: publish BDP",
  },
  seven_day_streak: {
    credits: 30,
    description: "Achievement reward: 7-day streak",
  },
  pathway_milestone: {
    credits: 100,
    description: "Achievement reward: complete pathway milestone",
  },
  refer_friend: {
    credits: 250,
    description: "Achievement reward: refer a friend",
  },
} as const;

export type BlizzwayAchievementKey = keyof typeof BLIZZWAY_ACHIEVEMENT_REWARDS;

export async function grantBlizzwayAchievementReward({
  businessId,
  userId,
  achievementKey,
  entityId,
}: {
  businessId: string;
  userId: string;
  achievementKey: BlizzwayAchievementKey;
  entityId?: string;
}) {
  const reward = BLIZZWAY_ACHIEVEMENT_REWARDS[achievementKey];
  const scopedEntity = entityId ?? "default";

  return topUpCareer7Credits({
    businessId,
    userId,
    amount: reward.credits,
    businessModel: BLIZZWAY_BUSINESS_MODEL,
    type: "REWARD",
    source: `achievement:${achievementKey}`,
    idempotencyKey: `blizzway:achievement:${businessId}:${userId}:${achievementKey}:${scopedEntity}`,
    description: reward.description,
    metadata: {
      achievementKey,
      entityId: entityId ?? null,
      credits: reward.credits,
    },
  });
}

export async function grantBlizzwayMonthlyCreditsForPlan({
  businessId,
  userId,
  planSlug,
  monthlyCredits,
  periodKey,
}: {
  businessId: string;
  userId: string;
  planSlug: string;
  monthlyCredits: number;
  periodKey: string;
}) {
  return topUpCareer7Credits({
    businessId,
    userId,
    amount: monthlyCredits,
    businessModel: BLIZZWAY_BUSINESS_MODEL,
    type: "MONTHLY_GRANT",
    source: `monthly_plan:${planSlug}`,
    idempotencyKey: `blizzway:monthly:${businessId}:${userId}:${planSlug}:${periodKey}`,
    description: `Monthly Blizzway credits for ${planSlug}`,
    metadata: {
      planSlug,
      periodKey,
      credits: monthlyCredits,
    },
  });
}

export async function debitCareer7Credits({
  businessId,
  userId,
  amount,
  businessModel = CAREER7_BUSINESS_MODEL,
  agentId,
  growthBoardItemId,
  description,
  metadata = {},
}: {
  businessId: string;
  userId: string;
  amount: number;
  businessModel?: BlizzwayBusinessModel;
  agentId?: string;
  growthBoardItemId?: string;
  description: string;
  metadata?: Prisma.InputJsonValue;
}) {
  const credits = Math.max(0, Math.round(amount));

  return prisma.$transaction(async (tx) => {
    const existing = await ensureCareer7Wallet(businessId, userId, tx);

    if (credits > 0) {
      const debit = await tx.career7CreditWallet.updateMany({
        where: {
          id: existing.id,
          balance: { gte: credits },
        },
        data: { balance: { decrement: credits } },
      });

      if (debit.count === 0) {
        return {
          ok: false as const,
          wallet: existing,
          ledger: null,
          error: "Insufficient Blizzway credits.",
        };
      }
    }

    const wallet = credits > 0
      ? await tx.career7CreditWallet.findUniqueOrThrow({ where: { id: existing.id } })
      : existing;

    const ledger = await tx.career7CreditLedger.create({
      data: {
        businessModel,
        businessId,
        userId,
        walletId: wallet.id,
        type: "USAGE",
        amount: -credits,
        balanceAfter: wallet.balance,
        agentId,
        growthBoardItemId,
        source: "usage",
        description,
        metadata,
      },
    });

    return { ok: true as const, wallet, ledger, error: null };
  });
}
