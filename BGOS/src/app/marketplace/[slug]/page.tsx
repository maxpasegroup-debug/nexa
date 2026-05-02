import { notFound } from "next/navigation";

import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AgentLandingPage } from "@/components/marketplace/agent-landing-page";
import type { AgentOfferView, MarketplaceAgentView } from "@/components/marketplace/types";

export const dynamic = "force-dynamic";

type AgentWithRelations = NonNullable<
  Awaited<ReturnType<typeof prisma.marketplaceAgent.findUnique>>
>;

function serializeAgent(agent: AgentWithRelations): MarketplaceAgentView {
  return {
    id: agent.id,
    slug: agent.slug,
    name: agent.name,
    tagline: agent.tagline,
    description: agent.description,
    category: agent.category,
    type: agent.type,
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
  };
}

function serializeOffer(offer: {
  id: string;
  agentId: string | null;
  name: string;
  description: string;
  offerType: string;
  discount: number;
  isCombo: boolean;
  comboAgents: unknown;
  targetPlan: string | null;
  targetIndustry: string | null;
  validFrom: Date;
  validUntil: Date | null;
  isActive: boolean;
  usageCount: number;
}): AgentOfferView {
  return {
    ...offer,
    validFrom: offer.validFrom.toISOString(),
    validUntil: offer.validUntil?.toISOString() ?? null,
  };
}

export default async function AgentRoutePage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await auth();
  const businessId = session?.user?.businessId ?? null;
  const now = new Date();

  const agent = await prisma.marketplaceAgent.findUnique({
    where: { slug: params.slug },
  });

  if (!agent || !agent.isActive) notFound();

  const [installation, offers] = await Promise.all([
    businessId
      ? prisma.agentInstallation.findUnique({
          where: { agentId_businessId: { agentId: agent.id, businessId } },
        })
      : Promise.resolve(null),
    prisma.agentOffer.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ validUntil: null }, { validUntil: { gt: now } }] },
          { OR: [{ agentId: agent.id }, { agentId: null }] },
        ],
      },
      orderBy: { validFrom: "desc" },
    }),
  ]);

  return (
    <AgentLandingPage
      agent={serializeAgent(agent)}
      isInstalled={Boolean(installation)}
      installStatus={installation?.status ?? null}
      businessId={businessId}
      offers={offers.map(serializeOffer)}
    />
  );
}
