import { NextResponse } from "next/server";
import type { PaymentGatewayProvider } from "@prisma/client";

import "@/lib/payment-callbacks";
import { getCareer7Context } from "@/lib/career7-auth";
import { CAREER7_BUSINESS_MODEL, ensureCareer7Wallet } from "@/lib/career7-wallet";
import { createPaymentIntent, getPaymentConfig, markPaymentSucceeded } from "@/lib/payments";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function requireContext() {
  const authResult = await getCareer7Context();
  if (authResult.response) return { error: authResult.response };

  return authResult.context;
}

export async function GET() {
  try {
    const context = await requireContext();
    if ("error" in context) return context.error;

    const paymentConfig = await getPaymentConfig(CAREER7_BUSINESS_MODEL, context.businessId);
    const wallet = await ensureCareer7Wallet(context.businessId, context.userId);
    const ledger = await prisma.career7CreditLedger.findMany({
      where: {
        businessModel: "career7",
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

async function readBody(request: Request) {
  try {
    return (await request.json()) as {
      gateway?: PaymentGatewayProvider;
      amount?: number;
      credits?: number;
    };
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireContext();
    if ("error" in context) return context.error;

    const body = await readBody(request);
    const amount = Math.max(0, Math.round(body.amount ?? 100000));
    const credits = Math.max(0, Math.round(body.credits ?? 1000));

    const { payment, checkout } = await createPaymentIntent({
      businessModel: CAREER7_BUSINESS_MODEL,
      businessId: context.businessId,
      userId: context.userId,
      amount,
      credits,
      gateway: body.gateway,
      description: `Career7 credit top-up: ${credits} credits`,
      metadata: {
        source: "career7.wallet",
      },
    });

    if (payment.gateway === "MANUAL") {
      await markPaymentSucceeded(payment.id, `manual_${payment.id}`, {
        completedBy: "manual",
      });
    }

    const wallet = await ensureCareer7Wallet(context.businessId, context.userId);

    return NextResponse.json({
      wallet: {
        primaryBalance: 0,
        credits: wallet.balance,
      },
      payment,
      checkout,
    });
  } catch (error) {
    console.error("[career7:wallet:top-up]", error);
    return NextResponse.json(
      { error: "Unable to top up Career7 credits." },
      { status: 500 },
    );
  }
}
