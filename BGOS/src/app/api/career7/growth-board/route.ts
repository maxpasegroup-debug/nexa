import { NextResponse } from "next/server";
import type { Career7GrowthBoardPath } from "@prisma/client";

import { getCareer7Context } from "@/lib/career7-auth";
import {
  ensureCareer7Wallet,
  isCareer7PaymentModeEnabled,
} from "@/lib/career7-wallet";
import { getString } from "@/lib/marketplace";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const paths: Career7GrowthBoardPath[] = ["LEARNING", "EARNING"];

function normalizePath(value: unknown): Career7GrowthBoardPath | null {
  const text = getString(value).toUpperCase();
  return paths.includes(text as Career7GrowthBoardPath)
    ? (text as Career7GrowthBoardPath)
    : null;
}

async function requireCareer7Context(request?: Request) {
  const authResult = await getCareer7Context(request);
  if (authResult.response) return { error: authResult.response };

  return authResult.context;
}

function serializeAgent(agent: {
  id: string;
  slug: string;
  name: string;
  category: string;
  career7Type: string | null;
  creditPrice: number;
  description: string;
  icon: string;
  career7Status: string;
  isPrebuilt: boolean;
  isRequestable: boolean;
  canAddToGrowthBoard: boolean;
  colorPrimary: string;
  colorSecondary: string;
  gradient: string;
}) {
  return {
    id: agent.id,
    slug: agent.slug,
    name: agent.name,
    category: agent.category,
    type: agent.career7Type?.toLowerCase() ?? null,
    creditPrice: agent.creditPrice,
    description: agent.description,
    icon: agent.icon,
    status: agent.career7Status.toLowerCase(),
    isPrebuilt: agent.isPrebuilt,
    isRequestable: agent.isRequestable,
    canAddToGrowthBoard: agent.canAddToGrowthBoard,
    colorPrimary: agent.colorPrimary,
    colorSecondary: agent.colorSecondary,
    gradient: agent.gradient,
  };
}

function serializeBoardItem(item: Awaited<ReturnType<typeof getBoardItems>>[number]) {
  return {
    id: item.id,
    path: item.path.toLowerCase(),
    status: item.status.toLowerCase(),
    addedAt: item.addedAt,
    deactivatedAt: item.deactivatedAt,
    agent: serializeAgent(item.agent),
  };
}

async function getBoardItems(businessId: string, userId: string) {
  return prisma.career7GrowthBoardAgent.findMany({
    where: { businessId, userId },
    include: { agent: true },
    orderBy: [{ status: "asc" }, { addedAt: "desc" }],
  });
}

async function getAvailableAgents() {
  return prisma.marketplaceAgent.findMany({
    where: {
      isActive: true,
      career7Type: { not: null },
      career7Status: { not: "ARCHIVED" },
      canAddToGrowthBoard: true,
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function GET(request: Request) {
  try {
    const context = await requireCareer7Context(request);
    if ("error" in context) return context.error;

    const [items, availableAgents] = await Promise.all([
      getBoardItems(context.businessId, context.userId),
      getAvailableAgents(),
    ]);

    const serialized = items.map(serializeBoardItem);
    const active = serialized.filter((item) => item.status === "active");

    return NextResponse.json({
      board: {
        learning: active.filter((item) => item.path === "learning"),
        earning: active.filter((item) => item.path === "earning"),
        inactive: serialized.filter((item) => item.status !== "active"),
      },
      activeCounts: {
        learning: active.filter((item) => item.path === "learning").length,
        earning: active.filter((item) => item.path === "earning").length,
        total: active.length,
      },
      marketplaceAgents: availableAgents.map(serializeAgent),
      wallet: await ensureCareer7Wallet(context.businessId, context.userId),
      paymentModeEnabled: isCareer7PaymentModeEnabled(),
      nexaRecommendation:
        "NEXA recommendation placeholder: add one communication agent to Learning and one income agent to Earning this week.",
    });
  } catch (error) {
    console.error("[career7:growth-board:get]", error);
    return NextResponse.json(
      { error: "Unable to load Career7 Growth Board." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireCareer7Context(request);
    if ("error" in context) return context.error;

    const body = (await request.json()) as Record<string, unknown>;
    const agentId = getString(body.agentId);
    const path = normalizePath(body.path);

    if (!agentId || !path) {
      return NextResponse.json(
        { error: "agentId and path are required." },
        { status: 400 },
      );
    }

    const agent = await prisma.marketplaceAgent.findFirst({
      where: {
        id: agentId,
        isActive: true,
        career7Type: { not: null },
        career7Status: "ACTIVE",
        canAddToGrowthBoard: true,
      },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Agent is not available for the Career7 Growth Board." },
        { status: 404 },
      );
    }

    const paymentModeEnabled = isCareer7PaymentModeEnabled();
    const item = await prisma.$transaction(
      async (tx) => {
        const existing = await tx.career7GrowthBoardAgent.findUnique({
          where: {
            businessId_userId_agentId_path: {
              businessId: context.businessId,
              userId: context.userId,
              agentId,
              path,
            },
          },
          include: { agent: true },
        });

        if (existing?.status === "ACTIVE") {
          return existing;
        }

        const wallet = await ensureCareer7Wallet(context.businessId, context.userId, tx);
        const creditCost = paymentModeEnabled ? agent.creditPrice : 0;
        let balanceAfter = wallet.balance;

        if (creditCost > 0) {
          const debit = await tx.career7CreditWallet.updateMany({
            where: { id: wallet.id, balance: { gte: creditCost } },
            data: { balance: { decrement: creditCost } },
          });

          if (debit.count === 0) {
            throw new Error("INSUFFICIENT_CREDITS");
          }

          const updatedWallet = await tx.career7CreditWallet.findUniqueOrThrow({
            where: { id: wallet.id },
          });
          balanceAfter = updatedWallet.balance;
        }

        const activated = await tx.career7GrowthBoardAgent.upsert({
          where: {
            businessId_userId_agentId_path: {
              businessId: context.businessId,
              userId: context.userId,
              agentId,
              path,
            },
          },
          create: {
            businessId: context.businessId,
            userId: context.userId,
            agentId,
            path,
            status: "ACTIVE",
          },
          update: {
            status: "ACTIVE",
            deactivatedAt: null,
            addedAt: new Date(),
          },
          include: { agent: true },
        });

        await tx.career7CreditLedger.create({
          data: {
            businessModel: context.businessModel,
            businessId: context.businessId,
            userId: context.userId,
            walletId: wallet.id,
            type: "USAGE",
            amount: -creditCost,
            balanceAfter,
            agentId: agent.id,
            growthBoardItemId: activated.id,
            description: `Activated ${agent.name} on Blizzway ${path.toLowerCase()} path`,
            metadata: {
              paymentModeEnabled,
              creditPrice: agent.creditPrice,
              path,
            },
          },
        });

        return activated;
      },
      { timeout: 15000 },
    );

    return NextResponse.json({ item: serializeBoardItem(item) }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json(
        { error: "Insufficient Career7 credits." },
        { status: 402 },
      );
    }

    console.error("[career7:growth-board:add]", error);
    return NextResponse.json(
      { error: "Unable to add agent to Career7 Growth Board." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const context = await requireCareer7Context(request);
    if ("error" in context) return context.error;

    const body = (await request.json()) as Record<string, unknown>;
    const id = getString(body.id);
    const active = body.active === true;

    if (!id) {
      return NextResponse.json({ error: "id is required." }, { status: 400 });
    }

    const existing = await prisma.career7GrowthBoardAgent.findFirst({
      where: {
        id,
        businessId: context.businessId,
        userId: context.userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Growth Board agent not found." },
        { status: 404 },
      );
    }

    const item = await prisma.career7GrowthBoardAgent.update({
      where: { id },
      data: active
        ? { status: "ACTIVE", deactivatedAt: null, addedAt: new Date() }
        : { status: "INACTIVE", deactivatedAt: new Date() },
      include: { agent: true },
    });

    return NextResponse.json({ item: serializeBoardItem(item) });
  } catch (error) {
    console.error("[career7:growth-board:update]", error);
    return NextResponse.json(
      { error: "Unable to update Career7 Growth Board agent." },
      { status: 500 },
    );
  }
}
