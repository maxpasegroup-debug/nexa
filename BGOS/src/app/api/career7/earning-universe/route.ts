import { NextResponse } from "next/server";

import { getCareer7Context } from "@/lib/career7-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;

    const boardItems = await prisma.career7GrowthBoardAgent.findMany({
      where: {
        businessId: authResult.context.businessId,
        userId: authResult.context.userId,
        path: "EARNING",
        status: "ACTIVE",
      },
      include: { agent: true },
      orderBy: { addedAt: "desc" },
    });

    const opportunities = boardItems.length
      ? boardItems.map((item) => ({
          id: item.id,
          title: item.agent.name,
          category: item.agent.category,
          status: "active",
          estimatedValue: null,
        }))
      : [
          { id: "starter-proof-offer", title: "Package one proof story into a simple service", category: "starter", status: "suggested", estimatedValue: null },
          { id: "starter-freelance-scan", title: "Review beginner-friendly freelance categories", category: "starter", status: "suggested", estimatedValue: null },
        ];

    return NextResponse.json({
      universe: {
        opportunities,
        activeCount: opportunities.filter((item) => item.status === "active").length,
        completedCount: opportunities.filter((item) => item.status === "completed").length,
      },
      source: boardItems.length ? "growth-board" : "starter",
    });
  } catch (error) {
    console.error("[career7:earning-universe]", error);
    return NextResponse.json({ error: "Unable to load Earning Universe." }, { status: 500 });
  }
}
