import { NextResponse } from "next/server";

import { getCareer7Context } from "@/lib/career7-auth";
import { buildStarterPathway } from "@/lib/career7-data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;

    const activeCount = await prisma.career7GrowthBoardAgent.count({
      where: {
        businessId: authResult.context.businessId,
        userId: authResult.context.userId,
        status: "ACTIVE",
      },
    });
    const pathway = await buildStarterPathway(authResult.context, activeCount);

    return NextResponse.json({
      pathway,
      source: activeCount ? "growth-board" : "starter",
    });
  } catch (error) {
    console.error("[career7:pathway]", error);
    return NextResponse.json({ error: "Unable to load Blizzway pathway." }, { status: 500 });
  }
}
