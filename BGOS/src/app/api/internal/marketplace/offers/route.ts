import type { OfferType } from "@prisma/client";
import { NextResponse } from "next/server";

import { getBool, getDate, getNumber, getString, requireSession } from "@/lib/marketplace";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const offerTypes: OfferType[] = [
  "SETUP_WAIVED",
  "MONTHLY_DISCOUNT",
  "FIRST_MONTH_FREE",
  "COMBO_DISCOUNT",
  "PERCENTAGE_OFF",
];

function isOfferType(value: unknown): value is OfferType {
  return typeof value === "string" && offerTypes.includes(value as OfferType);
}

export async function GET() {
  try {
    const authResult = await requireSession(["OWNER"]);
    if ("error" in authResult) return authResult.error;

    const offers = await prisma.agentOffer.findMany({
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            slug: true,
            monthlyFee: true,
            onboardingFee: true,
            _count: { select: { installations: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      offers: offers.map((offer) => ({
        ...offer,
        installationCount: offer.agent?._count.installations ?? 0,
        revenueImpact: offer.usageCount * offer.discount,
      })),
    });
  } catch (error) {
    console.error("[internal:marketplace:offers]", error);
    return NextResponse.json(
      { error: "Unable to fetch marketplace offers." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await requireSession(["OWNER"]);
    if ("error" in authResult) return authResult.error;

    const body = (await request.json()) as Record<string, unknown>;
    const name = getString(body.name);
    const description = getString(body.description);
    const offerType = getString(body.offerType);
    const discount = getNumber(body.discount);
    const validFrom = getDate(body.validFrom);
    const validUntil = getDate(body.validUntil);
    const agentId = getString(body.agentId) || undefined;

    if (
      !name ||
      !description ||
      !isOfferType(offerType) ||
      discount === undefined ||
      !validFrom
    ) {
      return NextResponse.json(
        { error: "Missing or invalid offer fields." },
        { status: 400 },
      );
    }

    const offer = await prisma.agentOffer.create({
      data: {
        agentId,
        name,
        description,
        offerType,
        discount,
        isCombo: getBool(body.isCombo) ?? false,
        comboAgents: body.comboAgents ?? [],
        targetPlan: getString(body.targetPlan) || undefined,
        targetIndustry: getString(body.targetIndustry) || undefined,
        validFrom,
        validUntil,
        isActive: getBool(body.isActive) ?? true,
      },
    });

    return NextResponse.json({ offer }, { status: 201 });
  } catch (error) {
    console.error("[internal:marketplace:offers:create]", error);
    return NextResponse.json(
      { error: "Unable to create marketplace offer." },
      { status: 500 },
    );
  }
}
