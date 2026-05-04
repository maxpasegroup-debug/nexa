import type { Prisma, PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type Tx = Prisma.TransactionClient;

export const CAREER7_BUSINESS_MODEL = "career7";

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
  description = "Dummy Career7 credit top-up",
  metadata = {},
}: {
  businessId: string;
  userId: string;
  amount: number;
  description?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  const credits = Math.max(0, Math.round(amount));
  if (credits <= 0) {
    throw new Error("Top-up amount must be greater than zero.");
  }

  return prisma.$transaction(async (tx) => {
    await ensureCareer7Wallet(businessId, userId, tx);

    const wallet = await tx.career7CreditWallet.update({
      where: { businessId_userId: { businessId, userId } },
      data: { balance: { increment: credits } },
    });

    const ledger = await tx.career7CreditLedger.create({
      data: {
        businessModel: CAREER7_BUSINESS_MODEL,
        businessId,
        userId,
        walletId: wallet.id,
        type: "TOP_UP",
        amount: credits,
        balanceAfter: wallet.balance,
        description,
        metadata,
      },
    });

    return { wallet, ledger };
  });
}

export async function debitCareer7Credits({
  businessId,
  userId,
  amount,
  agentId,
  growthBoardItemId,
  description,
  metadata = {},
}: {
  businessId: string;
  userId: string;
  amount: number;
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
          error: "Insufficient Career7 credits.",
        };
      }
    }

    const wallet = credits > 0
      ? await tx.career7CreditWallet.findUniqueOrThrow({ where: { id: existing.id } })
      : existing;

    const ledger = await tx.career7CreditLedger.create({
      data: {
        businessModel: CAREER7_BUSINESS_MODEL,
        businessId,
        userId,
        walletId: wallet.id,
        type: "USAGE",
        amount: -credits,
        balanceAfter: wallet.balance,
        agentId,
        growthBoardItemId,
        description,
        metadata,
      },
    });

    return { ok: true as const, wallet, ledger, error: null };
  });
}
