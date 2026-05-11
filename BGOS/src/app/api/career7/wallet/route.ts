import { NextResponse } from "next/server";

import "@/lib/payment-callbacks";
import {
  getBlizzwayCreditPackage,
  listBlizzwayCreditPackages,
  listBlizzwaySubscriptionPlans,
} from "@/lib/blizzway-pricing";
import { getCareer7Context } from "@/lib/career7-auth";
import {
  BLIZZWAY_BUSINESS_MODEL_ALIASES,
  ensureCareer7Wallet,
} from "@/lib/career7-wallet";
import { createPaymentIntent, getPaymentConfig } from "@/lib/payments";
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

    const [paymentConfig, wallet, ledger, packages, subscriptionPlans, invoices] =
      await Promise.all([
        getPaymentConfig(context.businessModel, context.businessId),
        ensureCareer7Wallet(context.businessId, context.userId),
        prisma.career7CreditLedger.findMany({
          where: {
            businessModel: { in: [...BLIZZWAY_BUSINESS_MODEL_ALIASES] },
            businessId: context.businessId,
            userId: context.userId,
          },
          orderBy: { createdAt: "desc" },
          take: 12,
        }),
        listBlizzwayCreditPackages(),
        listBlizzwaySubscriptionPlans(),
        prisma.bgosInvoicePlaceholder.findMany({
          where: {
            businessModel: { in: [...BLIZZWAY_BUSINESS_MODEL_ALIASES] },
            businessId: context.businessId,
            userId: context.userId,
          },
          orderBy: { createdAt: "desc" },
          take: 12,
        }),
      ]);

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
      creditPackages: packages,
      subscriptionPlans,
      invoices,
    });
  } catch (error) {
    console.error("[career7:wallet:get]", error);
    return NextResponse.json(
      { error: "Unable to load Blizzway wallet." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireContext(request);
    if ("error" in context) return context.error;

    const body = (await request.json()) as {
      packageId?: string;
      packageSlug?: string;
      gateway?: "RAZORPAY" | "STRIPE" | "PAYPAL" | "CASHFREE" | "MANUAL";
      idempotencyKey?: string;
    };
    const selectedPackage = await getBlizzwayCreditPackage(body.packageId ?? body.packageSlug ?? "");

    if (!selectedPackage) {
      return NextResponse.json({ error: "Invalid Blizzway credit package." }, { status: 400 });
    }

    const order = await createPaymentIntent({
      businessModel: context.businessModel,
      businessId: context.businessId,
      userId: context.userId,
      amount: selectedPackage.priceInr * 100,
      credits: selectedPackage.totalCredits,
      description: `Blizzway ${selectedPackage.name} credit pack`,
      gateway: body.gateway,
      idempotencyKey:
        body.idempotencyKey ??
        `blizzway:top-up-order:${context.businessId}:${context.userId}:${selectedPackage.slug}:${Date.now()}`,
      metadata: {
        packageId: selectedPackage.id,
        packageSlug: selectedPackage.slug,
        packageName: selectedPackage.name,
        priceInr: selectedPackage.priceInr,
        baseCredits: selectedPackage.baseCredits,
        bonusCredits: selectedPackage.bonusCredits,
        totalCredits: selectedPackage.totalCredits,
      },
    });

    return NextResponse.json(
      {
        payment: order.payment,
        checkout: order.checkout,
        package: selectedPackage,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[career7:wallet:top-up]", error);
    return NextResponse.json(
      { error: "Unable to process Blizzway wallet top-up." },
      { status: 500 },
    );
  }
}
