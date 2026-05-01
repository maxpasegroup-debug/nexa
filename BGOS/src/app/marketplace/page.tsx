import type { Metadata } from "next";

import { MarketplacePage } from "@/components/marketplace/marketplace-page";
import type { MarketplaceAgentView } from "@/components/marketplace/types";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "BGOS Marketplace - AI agents for your business",
  description:
    "Plug-and-play AI agents for sales, HR, finance, healthcare, education, construction, real estate, and retail.",
};

type RawAgent = Awaited<ReturnType<typeof prisma.marketplaceAgent.findMany>>[number];

function serializeAgent(agent: RawAgent): MarketplaceAgentView {
  return {
    id: agent.id,
    slug: agent.slug,
    name: agent.name,
    tagline: agent.tagline,
    description: agent.description,
    category: agent.category,
    icon: agent.icon,
    colorPrimary: agent.colorPrimary,
    colorSecondary: agent.colorSecondary,
    gradient: agent.gradient,
    onboardingFee: agent.onboardingFee,
    monthlyFee: agent.monthlyFee,
    isActive: agent.isActive,
    isFeatured: agent.isFeatured,
    sortOrder: agent.sortOrder,
    features: agent.features,
    benefits: agent.benefits,
    howItWorks: agent.howItWorks,
    stats: agent.stats,
    metaTitle: agent.metaTitle,
    metaDesc: agent.metaDesc,
    installed: false,
    installStatus: null,
  };
}

export default async function MarketplaceRoutePage() {
  const agents = await prisma.marketplaceAgent.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return <MarketplacePage initialAgents={agents.map(serializeAgent)} />;
}
