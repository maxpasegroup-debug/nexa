import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import {
  getBool,
  getNumber,
  getString,
  isAgentCategory,
  requireSession,
} from "@/lib/marketplace";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function readAgentData(
  body: Record<string, unknown>,
): { data: Prisma.MarketplaceAgentCreateInput } | { error: string } {
  const name = getString(body.name);
  const slug = getString(body.slug);
  const tagline = getString(body.tagline);
  const description = getString(body.description);
  const category = getString(body.category);
  const icon = getString(body.icon);
  const colorPrimary = getString(body.colorPrimary);
  const colorSecondary = getString(body.colorSecondary);
  const gradient = getString(body.gradient);
  const onboardingFee = getNumber(body.onboardingFee);
  const monthlyFee = getNumber(body.monthlyFee);

  if (
    !name ||
    !slug ||
    !tagline ||
    !description ||
    !isAgentCategory(category) ||
    !icon ||
    !colorPrimary ||
    !colorSecondary ||
    !gradient ||
    onboardingFee === undefined ||
    monthlyFee === undefined
  ) {
    return { error: "Missing or invalid marketplace agent fields." };
  }

  return {
    data: {
      slug,
      name,
      tagline,
      description,
      category,
      icon,
      colorPrimary,
      colorSecondary,
      gradient,
      onboardingFee,
      monthlyFee,
      isActive: getBool(body.isActive) ?? true,
      isFeatured: getBool(body.isFeatured) ?? false,
      sortOrder: getNumber(body.sortOrder) ?? 0,
      features: body.features ?? [],
      benefits: body.benefits ?? [],
      howItWorks: body.howItWorks ?? [],
      stats: body.stats ?? {},
      metaTitle: getString(body.metaTitle) || undefined,
      metaDesc: getString(body.metaDesc) || undefined,
    },
  };
}

export async function GET() {
  try {
    const authResult = await requireSession(["OWNER"]);
    if ("error" in authResult) return authResult.error;

    const [agents, installations, offers] = await Promise.all([
      prisma.marketplaceAgent.findMany({
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: { _count: { select: { installations: true, offers: true } } },
      }),
      prisma.agentInstallation.findMany({
        include: {
          agent: { select: { id: true, name: true, slug: true, onboardingFee: true, monthlyFee: true } },
          business: { select: { id: true, name: true, type: true } },
          sdeAssignee: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.agentOffer.findMany({
        include: { agent: { select: { id: true, name: true, slug: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const paidInstallations = installations.filter((item) => item.onboardingFeePaid);
    const activeInstallations = installations.filter((item) => item.status === "ACTIVE");

    const revenue = {
      totalOnboardingFees: paidInstallations.reduce(
        (sum, item) => sum + item.agent.onboardingFee,
        0,
      ),
      totalMonthlyMRR: activeInstallations.reduce(
        (sum, item) => sum + item.agent.monthlyFee,
        0,
      ),
      installationCount: installations.length,
      activeInstallationCount: activeInstallations.length,
    };

    const offerPerformance = offers.map((offer) => ({
      ...offer,
      revenueImpact: offer.usageCount * offer.discount,
    }));

    return NextResponse.json({
      agents,
      installations,
      revenue,
      offerPerformance,
    });
  } catch (error) {
    console.error("[internal:marketplace]", error);
    return NextResponse.json(
      { error: "Unable to fetch marketplace summary." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await requireSession(["OWNER"]);
    if ("error" in authResult) return authResult.error;

    const body = (await request.json()) as Record<string, unknown>;
    const parsed = readAgentData(body);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const agent = await prisma.marketplaceAgent.create({
      data: parsed.data,
    });

    return NextResponse.json({ agent }, { status: 201 });
  } catch (error) {
    console.error("[internal:marketplace:create]", error);
    return NextResponse.json(
      { error: "Unable to create marketplace agent." },
      { status: 500 },
    );
  }
}
