import { NextResponse } from "next/server";

import "@/lib/payment-callbacks";
import { getCareer7Context } from "@/lib/career7-auth";
import {
  BLIZZWAY_BUSINESS_MODEL_ALIASES,
  ensureCareer7Wallet,
} from "@/lib/career7-wallet";
import { getPaymentConfig } from "@/lib/payments";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function requireContext(request?: Request) {
  const authResult = await getCareer7Context(request);
  if (authResult.response) return { error: authResult.response };

  return authResult.context;
}

export async function GET(request: Request) {
  try {
    const context = await requireContext(request);
    if ("error" in context) return context.error;

    const paymentConfig = await getPaymentConfig(context.businessModel, context.businessId);
    const wallet = await ensureCareer7Wallet(context.businessId, context.userId);
    const ledger = await prisma.career7CreditLedger.findMany({
      where: {
        businessModel: { in: [...BLIZZWAY_BUSINESS_MODEL_ALIASES] },
        businessId: context.businessId,
        userId: context.userId,
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    });

    return NextResponse.json({
      wallet: {
        primaryBalance: 0,
        credits: wallet.balance,
        recentTransactions: ledger.map((entry) => ({
          id: entry.id,
          type: entry.amount >= 0 ? "Earned" : "Spent",
          amount: Math.abs(entry.amount),
          description: entry.description,
          businessModel: entry.businessModel,
          date: entry.createdAt,
        })),
      },
      payment: {
        enabledGateways: paymentConfig.enabledGateways,
        defaultGateway: paymentConfig.defaultGateway,
        currency: paymentConfig.currency,
      },
    });
  } catch (error) {
    console.error("[career7:wallet:get]", error);
    return NextResponse.json(
      { error: "Unable to load Career7 wallet." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireContext(request);
    if ("error" in context) return context.error;

    return NextResponse.json(
      { error: "Blizzway wallet top-ups are not implemented yet." },
      { status: 501 },
    );
  } catch (error) {
    console.error("[career7:wallet:top-up]", error);
    return NextResponse.json(
      { error: "Unable to process Blizzway wallet top-up." },
      { status: 500 },
    );
  }
}
