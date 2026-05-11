import { NextResponse } from "next/server";

import { getCareer7Context } from "@/lib/career7-auth";
import { pathwaySteps } from "@/lib/career7-data";
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
    const steps = pathwaySteps(activeCount);

    return NextResponse.json({
      pathway: {
        id: `pathway-${authResult.context.userId}`,
        title: activeCount ? "Your active Blizzway pathway" : "Starter Blizzway pathway",
        currentStepId: steps[0]?.id ?? null,
        progress: Math.min(100, 25 + activeCount * 10),
        steps,
      },
      source: activeCount ? "growth-board" : "starter",
    });
  } catch (error) {
    console.error("[career7:pathway]", error);
    return NextResponse.json({ error: "Unable to load Blizzway pathway." }, { status: 500 });
  }
}
