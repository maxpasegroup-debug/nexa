import type { BgosPaymentIntent, PaymentGatewayProvider, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type JsonObject = Record<string, unknown>;

export type PaymentCallbackContext = {
  payment: BgosPaymentIntent;
  metadata: JsonObject;
};

type PaymentCallback = (context: PaymentCallbackContext) => Promise<void>;

type PaymentProviderAdapter = {
  createIntent(input: {
    businessModel: string;
    businessId: string;
    userId: string;
    amount: number;
    currency: string;
    description: string;
    credits?: number;
    credentials: JsonObject;
    config: JsonObject;
    metadata: JsonObject;
  }): Promise<{
    providerOrderId?: string;
    metadata?: JsonObject;
    status?: "CREATED" | "PENDING" | "SUCCESS";
  }>;
};

const callbacks = new Map<string, PaymentCallback>();

export function registerPaymentCallback(name: string, callback: PaymentCallback) {
  callbacks.set(name, callback);
}

function asObject(value: Prisma.JsonValue | null | undefined): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
}

function asProvider(value: string | undefined): PaymentGatewayProvider | null {
  const normalized = value?.trim().toUpperCase();
  if (
    normalized === "RAZORPAY" ||
    normalized === "STRIPE" ||
    normalized === "PAYPAL" ||
    normalized === "CASHFREE" ||
    normalized === "MANUAL"
  ) {
    return normalized;
  }

  return null;
}

function readEnvGatewayList(raw: string | undefined): PaymentGatewayProvider[] {
  const providers = (raw ?? "")
    .split(",")
    .map((item) => asProvider(item))
    .filter((item): item is PaymentGatewayProvider => Boolean(item));

  return providers.length > 0 ? providers : ["MANUAL"];
}

function minorUnitsToCredits(amount: number, mapping: JsonObject): number {
  const creditsPerMajorUnit =
    typeof mapping.creditsPerMajorUnit === "number" ? mapping.creditsPerMajorUnit : 1;
  const fixedCredits = typeof mapping.fixedCredits === "number" ? mapping.fixedCredits : null;

  if (fixedCredits !== null) return Math.max(0, Math.round(fixedCredits));

  return Math.max(0, Math.round((amount / 100) * creditsPerMajorUnit));
}

function makeProviderAdapter(provider: PaymentGatewayProvider): PaymentProviderAdapter {
  return {
    async createIntent(input) {
      const providerPrefix = provider.toLowerCase();
      const providerOrderId = `${providerPrefix}_${crypto.randomUUID()}`;

      return {
        providerOrderId,
        status: provider === "MANUAL" ? "PENDING" : "CREATED",
        metadata: {
          provider,
          checkout: {
            mode: provider === "MANUAL" ? "manual" : "external",
            providerOrderId,
            amount: input.amount,
            currency: input.currency,
          },
        },
      };
    },
  };
}

export function getDefaultPaymentConfig(businessModel: string) {
  const upperModel = businessModel.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");
  const enabledGateways = readEnvGatewayList(
    process.env[`${upperModel}_PAYMENT_GATEWAYS`] ??
      process.env.BGOS_PAYMENT_GATEWAYS,
  );

  return {
    businessModel,
    enabledGateways,
    defaultGateway:
      asProvider(process.env[`${upperModel}_DEFAULT_PAYMENT_GATEWAY`]) ??
      asProvider(process.env.BGOS_DEFAULT_PAYMENT_GATEWAY) ??
      enabledGateways[0] ??
      "MANUAL",
    currency:
      process.env[`${upperModel}_PAYMENT_CURRENCY`] ??
      process.env.BGOS_PAYMENT_CURRENCY ??
      "INR",
    credentials: {},
    config: {},
    successCallback: `${businessModel}.payment.success`,
    failureCallback: `${businessModel}.payment.failure`,
    creditTopUpMapping: {
      creditsPerMajorUnit: Number(process.env[`${upperModel}_CREDITS_PER_UNIT`] ?? 1),
    },
  };
}

export async function getPaymentConfig(businessModel: string, businessId?: string) {
  const [businessConfig, modelConfig] = await Promise.all([
    businessId
      ? prisma.businessPaymentConfig.findFirst({
          where: { businessModel, businessId },
          orderBy: { updatedAt: "desc" },
        })
      : null,
    prisma.businessPaymentConfig.findFirst({
      where: { businessModel, businessId: null },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return businessConfig ?? modelConfig ?? getDefaultPaymentConfig(businessModel);
}

export async function upsertPaymentConfig({
  businessModel,
  businessId,
  enabledGateways,
  defaultGateway,
  currency,
  credentials,
  config,
  successCallback,
  failureCallback,
  creditTopUpMapping,
}: {
  businessModel: string;
  businessId?: string;
  enabledGateways: PaymentGatewayProvider[];
  defaultGateway: PaymentGatewayProvider;
  currency: string;
  credentials?: JsonObject;
  config?: JsonObject;
  successCallback: string;
  failureCallback: string;
  creditTopUpMapping?: JsonObject;
}) {
  if (!enabledGateways.includes(defaultGateway)) {
    throw new Error("defaultGateway must be included in enabledGateways.");
  }

  const existing = await prisma.businessPaymentConfig.findFirst({
    where: { businessModel, businessId: businessId ?? null },
    select: { id: true },
  });

  const data = {
    enabledGateways,
    defaultGateway,
    currency,
    credentials: (credentials ?? {}) as Prisma.InputJsonValue,
    config: (config ?? {}) as Prisma.InputJsonValue,
    successCallback,
    failureCallback,
    creditTopUpMapping: (creditTopUpMapping ?? {}) as Prisma.InputJsonValue,
  };

  if (existing) {
    return prisma.businessPaymentConfig.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.businessPaymentConfig.create({
    data: {
      businessModel,
      businessId,
      ...data,
    },
  });
}

export async function createPaymentIntent({
  businessModel,
  businessId,
  userId,
  amount,
  credits,
  description,
  gateway,
  metadata = {},
}: {
  businessModel: string;
  businessId: string;
  userId: string;
  amount: number;
  credits?: number;
  description: string;
  gateway?: PaymentGatewayProvider;
  metadata?: JsonObject;
}) {
  const config = await getPaymentConfig(businessModel, businessId);
  const selectedGateway = gateway ?? config.defaultGateway;

  if (!config.enabledGateways.includes(selectedGateway)) {
    throw new Error(`${selectedGateway} is not enabled for ${businessModel}.`);
  }

  const normalizedAmount = Math.max(0, Math.round(amount));
  if (normalizedAmount <= 0) {
    throw new Error("Payment amount must be greater than zero.");
  }

  const creditTopUpMapping = asObject(config.creditTopUpMapping as Prisma.JsonValue);
  const topUpCredits = credits ?? minorUnitsToCredits(normalizedAmount, creditTopUpMapping);
  const adapter = makeProviderAdapter(selectedGateway);
  const providerIntent = await adapter.createIntent({
    businessModel,
    businessId,
    userId,
    amount: normalizedAmount,
    currency: config.currency,
    description,
    credits: topUpCredits,
    credentials: asObject(config.credentials as Prisma.JsonValue),
    config: asObject(config.config as Prisma.JsonValue),
    metadata,
  });

  const payment = await prisma.bgosPaymentIntent.create({
    data: {
      businessModel,
      businessId,
      userId,
      configId: "id" in config ? config.id : undefined,
      gateway: selectedGateway,
      status: providerIntent.status ?? "CREATED",
      currency: config.currency,
      amount: normalizedAmount,
      credits: topUpCredits,
      description,
      providerOrderId: providerIntent.providerOrderId,
      successCallback: config.successCallback,
      failureCallback: config.failureCallback,
      metadata: {
        ...metadata,
        ...(providerIntent.metadata ?? {}),
        creditTopUpMapping,
      } as Prisma.InputJsonValue,
    },
  });

  return {
    payment,
    checkout: {
      ...asObject((providerIntent.metadata ?? {}).checkout as Prisma.JsonValue),
      paymentIntentId: payment.id,
      gateway: payment.gateway,
      providerOrderId: payment.providerOrderId,
    },
  };
}

export async function markPaymentSucceeded(
  paymentId: string,
  providerPaymentId?: string,
  metadata: JsonObject = {},
) {
  const existing = await prisma.bgosPaymentIntent.findUniqueOrThrow({
    where: { id: paymentId },
  });

  if (existing.status === "SUCCESS") {
    return existing;
  }

  const mergedMetadata = {
    ...asObject(existing.metadata),
    ...metadata,
  };

  const payment = await prisma.bgosPaymentIntent.update({
    where: { id: paymentId },
    data: {
      status: "SUCCESS",
      providerPaymentId,
      completedAt: new Date(),
      metadata: mergedMetadata as Prisma.InputJsonValue,
    },
  });

  const callback = callbacks.get(payment.successCallback);
  if (callback) {
    await callback({ payment, metadata: asObject(payment.metadata) });
  }

  return payment;
}

export async function markPaymentFailed(paymentId: string, metadata: JsonObject = {}) {
  const existing = await prisma.bgosPaymentIntent.findUniqueOrThrow({
    where: { id: paymentId },
  });
  const mergedMetadata = {
    ...asObject(existing.metadata),
    ...metadata,
  };

  const payment = await prisma.bgosPaymentIntent.update({
    where: { id: paymentId },
    data: {
      status: "FAILED",
      completedAt: new Date(),
      metadata: mergedMetadata as Prisma.InputJsonValue,
    },
  });

  const callback = callbacks.get(payment.failureCallback);
  if (callback) {
    await callback({ payment, metadata: asObject(payment.metadata) });
  }

  return payment;
}
