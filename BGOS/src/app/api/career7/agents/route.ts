import { NextResponse } from "next/server";

import { getCareer7Context } from "@/lib/career7-auth";
import {
  getCareer7AgentType,
  getCareer7MarketplaceStatus,
  isAgentCategory,
} from "@/lib/marketplace";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function toCareer7Agent(agent: Awaited<ReturnType<typeof getCareer7Agents>>[number]) {
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
    isFeatured: agent.isFeatured,
    sortOrder: agent.sortOrder,
  };
}

async function getCareer7Agents({
  category,
  type,
  status,
  growthBoardOnly,
}: {
  category?: string | null;
  type?: string | null;
  status?: string | null;
  growthBoardOnly?: boolean;
}) {
  const career7Type = getCareer7AgentType(type);
  const career7Status = getCareer7MarketplaceStatus(status);

  return prisma.marketplaceAgent.findMany({
    where: {
      isActive: true,
      career7Type: career7Type ? career7Type : { not: null },
      ...(career7Status ? { career7Status } : { career7Status: { not: "ARCHIVED" } }),
      ...(isAgentCategory(category) ? { category } : {}),
      ...(growthBoardOnly ? { canAddToGrowthBoard: true } : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function GET(request: Request) {
  try {
    const authResult = await getCareer7Context();
    if (authResult.response) return authResult.response;

    const { searchParams } = new URL(request.url);
    const growthBoardOnly = searchParams.get("growthBoardOnly") === "true";

    const agents = await getCareer7Agents({
      category: searchParams.get("category"),
      type: searchParams.get("type"),
      status: searchParams.get("status"),
      growthBoardOnly,
    });

    const mappedAgents = agents.map(toCareer7Agent);

    return NextResponse.json({
      agents: mappedAgents,
      total: mappedAgents.length,
      featured: mappedAgents.find((agent) => agent.isFeatured) ?? null,
    });
  } catch (error) {
    console.error("[career7:agents]", error);
    return NextResponse.json(
      { error: "Unable to fetch Career7 agents." },
      { status: 500 },
    );
  }
}
