import type { MarketplaceAgent, Prisma } from "@prisma/client";

import type { Career7Context } from "@/lib/career7-auth";
import { generateBlizzwayCompanionOutput } from "@/lib/blizzway-ai-output";
import { buildDocumentContextForCompanion } from "@/lib/blizzway-documents";
import { ensureCareer7Wallet, isCareer7PaymentModeEnabled } from "@/lib/career7-wallet";
import { prisma } from "@/lib/prisma";

export const companionCategories = [
  "BDP & Profile",
  "Assessments",
  "Career Growth",
  "Language & Communication",
  "Exam Coaching",
  "Admissions",
  "Migration & Global Mobility",
  "Learning Garden",
  "Earning Universe",
  "Happiness & Personal Growth",
  "Finance & Money Discipline",
  "Blizzway Premium",
] as const;

const guidanceOnlyNote =
  "Guidance only: Blizzway companions do not guarantee jobs, admissions, scholarships, visas, medical, legal, or financial outcomes.";

function asStringArray(value: Prisma.JsonValue | null | undefined): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function pricingMode(agent: Pick<MarketplaceAgent, "pricingMode" | "creditPrice">) {
  const mode = agent.pricingMode?.toLowerCase();
  if (mode === "free" || mode === "credits" || mode === "subscription" || mode === "premium") return mode;
  return agent.creditPrice > 0 ? "credits" : "free";
}

export function attachmentForCompanion(agent: Pick<MarketplaceAgent, "career7Type">) {
  if (agent.career7Type === "EARNING" || agent.career7Type === "FINANCE") return "earning";
  if (agent.career7Type === "LEARNING" || agent.career7Type === "LANGUAGE" || agent.career7Type === "EXAM") return "learning";
  return "pathway";
}

export function growthBoardPathForCompanion(agent: Pick<MarketplaceAgent, "career7Type">) {
  const attachedTo = attachmentForCompanion(agent);
  if (attachedTo === "learning") return "LEARNING" as const;
  if (attachedTo === "earning") return "EARNING" as const;
  return null;
}

export function recommendationForCategory(category: string) {
  if (category.includes("BDP")) return "NEXA recommends this when your profile proof, resume, or public identity needs sharper signals.";
  if (category.includes("Language")) return "NEXA recommends short daily practice loops before interviews, admissions calls, and client conversations.";
  if (category.includes("Migration") || category.includes("Admissions")) return "NEXA recommends using this as a preparation checklist, then verifying final decisions with official sources or qualified experts.";
  if (category.includes("Earning") || category.includes("Finance")) return "NEXA recommends practical next actions that protect your time, money, and confidence.";
  return "NEXA recommends activating one focused companion at a time and saving the output into your Blizzway pathway.";
}

export function safetyNoteForCategory(category: string) {
  if (category.includes("Migration")) return `${guidanceOnlyNote} Migration guidance must be checked against current official rules.`;
  if (category.includes("Admissions")) return `${guidanceOnlyNote} Admissions and scholarship guidance is preparation support, not an offer or acceptance.`;
  if (category.includes("Finance")) return `${guidanceOnlyNote} Money guidance is educational and not regulated financial advice.`;
  return guidanceOnlyNote;
}

type CompanionWithActivation = MarketplaceAgent & {
  blizzwayCompanionActivations?: Array<{ id: string; status: string; attachedTo: string; activatedAt: Date }>;
};

export function serializeCompanion(agent: CompanionWithActivation) {
  const activeActivation = agent.blizzwayCompanionActivations?.find((item) => item.status === "ACTIVE") ?? null;
  const category = agent.companionCategory || "Career Growth";

  return {
    id: agent.id,
    slug: agent.slug,
    name: agent.name,
    category,
    marketplaceCategory: agent.category,
    type: agent.career7Type?.toLowerCase() ?? null,
    shortDescription: agent.shortDescription || agent.tagline,
    description: agent.shortDescription || agent.description,
    longDescription: agent.longDescription || agent.description,
    icon: agent.icon,
    creditPrice: agent.creditPrice,
    creditCost: agent.creditPrice,
    pricingMode: pricingMode(agent),
    status: agent.career7Status.toLowerCase(),
    isFeatured: agent.isFeatured,
    isTrending: agent.isTrending || agent.sortOrder <= 5,
    isRequestable: agent.isRequestable,
    isPrebuilt: agent.isPrebuilt,
    canAddToGrowthBoard: agent.canAddToGrowthBoard,
    capabilities: asStringArray(agent.capabilities),
    expectedOutput: asStringArray(agent.expectedOutput),
    recommendedFor: asStringArray(agent.recommendedFor),
    requiredInputs: asStringArray(agent.requiredInputs),
    chargeOn: agent.chargeOn,
    colorPrimary: agent.colorPrimary,
    colorSecondary: agent.colorSecondary,
    gradient: agent.gradient,
    sortOrder: agent.sortOrder,
    active: Boolean(activeActivation),
    activation: activeActivation
      ? {
          id: activeActivation.id,
          status: activeActivation.status.toLowerCase(),
          attachedTo: activeActivation.attachedTo,
          activatedAt: activeActivation.activatedAt.toISOString(),
        }
      : null,
    nexaRecommendation: recommendationForCategory(category),
    safetyNote: safetyNoteForCategory(category),
  };
}

export async function findAvailableCompanion(slug: string, context: Career7Context) {
  return prisma.marketplaceAgent.findFirst({
    where: {
      slug,
      isActive: true,
      career7Type: { not: null },
      career7Status: { not: "ARCHIVED" },
      OR: [{ businessId: null }, { businessId: context.businessId }],
      businessModel: { in: [context.businessModel, "blizzway", "career7"] },
    },
    include: {
      blizzwayCompanionActivations: {
        where: {
          businessModel: context.businessModel,
          businessId: context.businessId,
          userId: context.userId,
          status: "ACTIVE",
        },
      },
    },
  });
}

export async function listCompanions(context: Career7Context, filters: { category?: string | null; status?: string | null; query?: string | null }) {
  const status = filters.status?.toUpperCase();
  const where: Prisma.MarketplaceAgentWhereInput = {
    isActive: true,
    career7Type: { not: null },
    career7Status: status === "DRAFT" || status === "ACTIVE" || status === "COMING_SOON" ? status : { not: "ARCHIVED" },
    OR: [{ businessId: null }, { businessId: context.businessId }],
    businessModel: { in: [context.businessModel, "blizzway", "career7"] },
    ...(filters.category && filters.category !== "All" ? { companionCategory: filters.category } : {}),
  };

  if (filters.query) {
    where.AND = [
      {
        OR: [
          { name: { contains: filters.query, mode: "insensitive" } },
          { tagline: { contains: filters.query, mode: "insensitive" } },
          { description: { contains: filters.query, mode: "insensitive" } },
          { companionCategory: { contains: filters.query, mode: "insensitive" } },
        ],
      },
    ];
  }

  return prisma.marketplaceAgent.findMany({
    where,
    include: {
      blizzwayCompanionActivations: {
        where: {
          businessModel: context.businessModel,
          businessId: context.businessId,
          userId: context.userId,
          status: "ACTIVE",
        },
      },
    },
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function listActiveCompanions(context: Career7Context) {
  return prisma.blizzwayCompanionActivation.findMany({
    where: {
      businessModel: context.businessModel,
      businessId: context.businessId,
      userId: context.userId,
      status: "ACTIVE",
    },
    include: { companion: true },
    orderBy: { activatedAt: "desc" },
  });
}

export async function activateCompanion(context: Career7Context, agent: MarketplaceAgent, idempotencyKey?: string) {
  const attachedTo = attachmentForCompanion(agent);
  const path = growthBoardPathForCompanion(agent);
  const mode = pricingMode(agent);
  const creditCost = isCareer7PaymentModeEnabled() && mode === "credits" && agent.chargeOn === "activation" ? agent.creditPrice : 0;

  return prisma.$transaction(async (tx) => {
    const existing = await tx.blizzwayCompanionActivation.findUnique({
      where: {
        businessModel_businessId_userId_companionId: {
          businessModel: context.businessModel,
          businessId: context.businessId,
          userId: context.userId,
          companionId: agent.id,
        },
      },
      include: { companion: true },
    });

    if (existing?.status === "ACTIVE") return { activation: existing, ledger: null, duplicate: true };

    const wallet = await ensureCareer7Wallet(context.businessId, context.userId, tx);
    let ledger = null;

    if (creditCost > 0) {
      const debit = await tx.career7CreditWallet.updateMany({
        where: { id: wallet.id, balance: { gte: creditCost } },
        data: { balance: { decrement: creditCost } },
      });
      if (debit.count === 0) throw new Error("INSUFFICIENT_CREDITS");

      const updatedWallet = await tx.career7CreditWallet.findUniqueOrThrow({ where: { id: wallet.id } });
      ledger = await tx.career7CreditLedger.create({
        data: {
          businessModel: context.businessModel,
          businessId: context.businessId,
          userId: context.userId,
          walletId: wallet.id,
          type: "USAGE",
          amount: -creditCost,
          balanceAfter: updatedWallet.balance,
          agentId: agent.id,
          source: "companion_activation",
          idempotencyKey: idempotencyKey ? `companion-activation:${idempotencyKey}` : undefined,
          description: `Activated ${agent.name} companion`,
          metadata: { slug: agent.slug, pricingMode: mode, chargeOn: agent.chargeOn },
        },
      });
    }

    const activation = await tx.blizzwayCompanionActivation.upsert({
      where: {
        businessModel_businessId_userId_companionId: {
          businessModel: context.businessModel,
          businessId: context.businessId,
          userId: context.userId,
          companionId: agent.id,
        },
      },
      create: {
        businessModel: context.businessModel,
        businessId: context.businessId,
        userId: context.userId,
        companionId: agent.id,
        attachedTo,
      },
      update: { status: "ACTIVE", attachedTo, activatedAt: new Date() },
      include: { companion: true },
    });

    if (path) {
      await tx.career7GrowthBoardAgent.upsert({
        where: {
          businessId_userId_agentId_path: {
            businessId: context.businessId,
            userId: context.userId,
            agentId: agent.id,
            path,
          },
        },
        create: { businessId: context.businessId, userId: context.userId, agentId: agent.id, path, status: "ACTIVE" },
        update: { status: "ACTIVE", deactivatedAt: null, addedAt: new Date() },
      });
    }

    return { activation, ledger, duplicate: false };
  });
}

export async function runCompanion({
  context,
  agent,
  inputs,
  idempotencyKey,
}: {
  context: Career7Context;
  agent: MarketplaceAgent;
  inputs: Record<string, unknown>;
  idempotencyKey?: string;
}) {
  const existing = idempotencyKey
    ? await prisma.blizzwayCompanionRun.findFirst({
        where: {
          idempotencyKey,
          businessModel: context.businessModel,
          businessId: context.businessId,
          userId: context.userId,
          companionId: agent.id,
        },
      })
    : null;
  if (existing) return { run: existing, duplicate: true };

  const mode = pricingMode(agent);
  const creditCost = isCareer7PaymentModeEnabled() && mode === "credits" && agent.chargeOn !== "activation" ? agent.creditPrice : 0;

  const [activation, wallet] = await Promise.all([
    prisma.blizzwayCompanionActivation.findUnique({
      where: {
        businessModel_businessId_userId_companionId: {
          businessModel: context.businessModel,
          businessId: context.businessId,
          userId: context.userId,
          companionId: agent.id,
        },
      },
    }),
    ensureCareer7Wallet(context.businessId, context.userId),
  ]);

  if (!activation || activation.status !== "ACTIVE") {
    throw new Error("COMPANION_NOT_ACTIVE");
  }

  if (creditCost > 0 && wallet.balance < creditCost) {
    throw new Error("INSUFFICIENT_CREDITS");
  }

  const documentContext = await buildDocumentContextForCompanion(
    context,
    `${agent.slug} ${agent.name} ${agent.companionCategory ?? ""}`,
  );
  const aiInputs = documentContext
    ? {
        ...inputs,
        uploadedDocumentContext: documentContext,
      }
    : inputs;
  const generated = await generateBlizzwayCompanionOutput({ agent, inputs: aiInputs });

  return prisma.$transaction(async (tx) => {
    const activeActivation = await tx.blizzwayCompanionActivation.findUnique({
      where: {
        businessModel_businessId_userId_companionId: {
          businessModel: context.businessModel,
          businessId: context.businessId,
          userId: context.userId,
          companionId: agent.id,
        },
      },
    });
    if (!activeActivation || activeActivation.status !== "ACTIVE") {
      throw new Error("COMPANION_NOT_ACTIVE");
    }

    const wallet = await ensureCareer7Wallet(context.businessId, context.userId, tx);
    let ledgerId: string | null = null;

    if (creditCost > 0) {
      const debit = await tx.career7CreditWallet.updateMany({
        where: { id: wallet.id, balance: { gte: creditCost } },
        data: { balance: { decrement: creditCost } },
      });
      if (debit.count === 0) throw new Error("INSUFFICIENT_CREDITS");

      const updatedWallet = await tx.career7CreditWallet.findUniqueOrThrow({ where: { id: wallet.id } });
      const ledger = await tx.career7CreditLedger.create({
        data: {
          businessModel: context.businessModel,
          businessId: context.businessId,
          userId: context.userId,
          walletId: wallet.id,
          type: "USAGE",
          amount: -creditCost,
          balanceAfter: updatedWallet.balance,
          agentId: agent.id,
          source: "companion_run",
          idempotencyKey: idempotencyKey ? `companion-run-ledger:${idempotencyKey}` : undefined,
          description: `Ran ${agent.name} companion`,
          metadata: {
            slug: agent.slug,
            pricingMode: mode,
            chargeOn: agent.chargeOn,
            provider: generated.output.provider,
            model: generated.output.model,
            promptTemplateKey: generated.output.promptTemplateKey,
            outputVersion: generated.output.outputVersion,
            fallbackUsed: generated.output.fallbackUsed,
          },
        },
      });
      ledgerId = ledger.id;
    }

    const run = await tx.blizzwayCompanionRun.create({
      data: {
        businessModel: context.businessModel,
        businessId: context.businessId,
        userId: context.userId,
        companionId: agent.id,
        activationId: activeActivation.id,
        input: generated.sanitizedInputs as Prisma.InputJsonObject,
        output: generated.output as unknown as Prisma.InputJsonObject,
        creditsCharged: creditCost,
        ledgerId,
        idempotencyKey,
        status: "COMPLETED",
      },
    });

    return { run, duplicate: false };
  });
}
