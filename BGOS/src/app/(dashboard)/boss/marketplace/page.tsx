import { redirect } from "next/navigation";

import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BossMarketplacePage } from "@/components/marketplace/boss-marketplace-page";
import type {
  AgentInstallationView,
  AgentOfferView,
  MarketplaceAgentView,
} from "@/components/marketplace/types";

export const dynamic = "force-dynamic";

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
  const now = Date.now();
  return {
    ...offer,
    validFrom: offer.validFrom.toISOString(),
    validUntil: offer.validUntil?.toISOString() ?? null,
    secondsUntilExpiry: offer.validUntil
      ? Math.max(0, Math.floor((offer.validUntil.getTime() - now) / 1000))
      : null,
  };
}

export default async function BossMarketplaceRoutePage() {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "BOSS" && session.user.role !== "OWNER") redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      businessId: true,
      business: { select: { id: true, name: true, type: true } },
    },
  });

  if (!user?.businessId || !user.business) redirect("/onboarding");

  const now = new Date();
  const [agents, installations, offers] = await Promise.all([
    prisma.marketplaceAgent.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.agentInstallation.findMany({
      where: { businessId: user.businessId },
      include: { agent: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.agentOffer.findMany({
      where: {
        isActive: true,
        OR: [{ validUntil: null }, { validUntil: { gt: now } }],
      },
      orderBy: { validFrom: "desc" },
    }),
  ]);

  const serializedAgents = agents.map(serializeAgent);

  return (
    <BossMarketplacePage
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }}
      business={user.business}
      agents={serializedAgents}
      installations={installations.map((installation): AgentInstallationView => ({
        id: installation.id,
        agentId: installation.agentId,
        businessId: installation.businessId,
        status: installation.status,
        onboardingFeePaid: installation.onboardingFeePaid,
        monthlyFeePaid: installation.monthlyFeePaid,
        razorpaySetupId: installation.razorpaySetupId,
        razorpayMandateId: installation.razorpayMandateId,
        installedAt: installation.installedAt?.toISOString() ?? null,
        activeFrom: installation.activeFrom?.toISOString() ?? null,
        cancelledAt: installation.cancelledAt?.toISOString() ?? null,
        cancelReason: installation.cancelReason,
        sdeAssignedId: installation.sdeAssignedId,
        sdeCompletedAt: installation.sdeCompletedAt?.toISOString() ?? null,
        whitelabelName: installation.whitelabelName,
        whitelabelIcon: installation.whitelabelIcon,
        isWhitelabeled: installation.isWhitelabeled,
        createdAt: installation.createdAt.toISOString(),
        updatedAt: installation.updatedAt.toISOString(),
        agent: serializeAgent(installation.agent),
      }))}
      offers={offers.map(serializeOffer)}
    />
  );
}
