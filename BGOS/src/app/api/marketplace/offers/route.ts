import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetPlan = searchParams.get("targetPlan")?.trim();
    const targetIndustry = searchParams.get("targetIndustry")?.trim();
    const now = new Date();

    const offers = await prisma.agentOffer.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ validUntil: null }, { validUntil: { gt: now } }] },
          ...(targetPlan ? [{ OR: [{ targetPlan: null }, { targetPlan }] }] : []),
        ],
        ...(targetIndustry
          ? { targetIndustry: { equals: targetIndustry, mode: "insensitive" } }
          : {}),
      },
      include: {
        agent: { select: { id: true, slug: true, name: true, monthlyFee: true } },
      },
      orderBy: { validFrom: "desc" },
    });

    return NextResponse.json({
      offers: offers.map((offer) => ({
        ...offer,
        secondsUntilExpiry: offer.validUntil
          ? Math.max(0, Math.floor((offer.validUntil.getTime() - now.getTime()) / 1000))
          : null,
      })),
    });
  } catch (error) {
    console.error("[marketplace:offers]", error);
    return NextResponse.json(
      { error: "Unable to fetch marketplace offers." },
      { status: 500 },
    );
  }
}
