import { requireInternalOwner } from "@/lib/internal-owner";
import { prisma } from "@/lib/prisma";
import {
  InternalMarketplacePage,
  type InternalMarketplaceInstallation,
} from "@/components/internal/marketplace-manager";
import type { AgentOfferView, MarketplaceAgentView } from "@/components/marketplace/types";

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
  return {
    ...offer,
    validFrom: offer.validFrom.toISOString(),
    validUntil: offer.validUntil?.toISOString() ?? null,
  };
}

function planForUserCount(userCount: number) {
  if (userCount >= 20) return "scale";
  if (userCount >= 6) return "growth";
  return "starter";
}

export default async function InternalMarketplaceRoutePage() {
  const { owner, business: internalBusiness } = await requireInternalOwner();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [agents, installations, offers, sdes, customers] = await Promise.all([
    prisma.marketplaceAgent.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.agentInstallation.findMany({
      include: {
        agent: true,
        business: { select: { id: true, name: true, type: true, users: { select: { id: true } } } },
        sdeAssignee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.agentOffer.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.user.findMany({
      where: { role: "SDE", active: true, ...(internalBusiness?.id ? { businessId: internalBusiness.id } : {}) },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
    prisma.business.findMany({
      where: internalBusiness?.id ? { id: { not: internalBusiness.id } } : {},
      select: {
        id: true,
        name: true,
        type: true,
        users: { select: { id: true } },
        agentInstallations: { select: { id: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const serializedAgents = agents.map(serializeAgent);
  const paidInstallations = installations.filter((item) => item.onboardingFeePaid);
  const activeInstallations = installations.filter((item) => item.status === "ACTIVE");
  const thisMonthInstallations = installations.filter((item) => item.createdAt >= startOfMonth);
  const setupFeeRevenueThisMonth = paidInstallations
    .filter((item) => item.createdAt >= startOfMonth)
    .reduce((sum, item) => sum + item.agent.onboardingFee, 0);
  const agentCounts = new Map<string, number>();
  installations.forEach((item) => agentCounts.set(item.agent.name, (agentCounts.get(item.agent.name) ?? 0) + 1));
  const mostPopularAgent =
    Array.from(agentCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    "No installs yet";

  return (
    <InternalMarketplacePage
      user={{
        id: owner.id,
        name: owner.name,
        email: owner.email,
        role: owner.role,
      }}
      agents={serializedAgents}
      installations={installations.map((installation): InternalMarketplaceInstallation => ({
        id: installation.id,
        agentId: installation.agentId,
        businessId: installation.businessId,
        status: installation.status,
        onboardingFeePaid: installation.onboardingFeePaid,
        monthlyFeePaid: installation.monthlyFeePaid,
        installedAt: installation.installedAt?.toISOString() ?? null,
        activeFrom: installation.activeFrom?.toISOString() ?? null,
        createdAt: installation.createdAt.toISOString(),
        agent: {
          id: installation.agent.id,
          name: installation.agent.name,
          slug: installation.agent.slug,
          icon: installation.agent.icon,
          monthlyFee: installation.agent.monthlyFee,
          onboardingFee: installation.agent.onboardingFee,
        },
        business: {
          id: installation.business.id,
          name: installation.business.name,
          type: installation.business.type,
        },
        sdeAssignee: installation.sdeAssignee,
      }))}
      offers={offers.map(serializeOffer)}
      sdes={sdes}
      customers={customers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        plan: planForUserCount(customer.users.length),
        industry: customer.type,
        agentCount: customer.agentInstallations.length,
      }))}
      revenue={{
        totalInstallationsThisMonth: thisMonthInstallations.length,
        totalOnboardingFeeRevenue: paidInstallations.reduce((sum, item) => sum + item.agent.onboardingFee, 0),
        totalMonthlyMRR: activeInstallations.reduce((sum, item) => sum + item.agent.monthlyFee, 0),
        mostPopularAgent,
        averageAgentsPerCustomer: customers.length > 0 ? installations.length / customers.length : 0,
        setupFeeRevenueThisMonth,
      }}
    />
  );
}
