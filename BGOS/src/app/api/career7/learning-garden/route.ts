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
        path: "LEARNING",
        status: "ACTIVE",
      },
      include: { agent: true },
      orderBy: { addedAt: "desc" },
    });

    const starterItems = [
      { id: "starter-communication", title: "Start communication practice", type: "communication", status: "not_started", progress: 0 },
      { id: "starter-academic", title: "Complete Academic Readiness Check", type: "assessment", status: "not_started", progress: 0 },
    ];
    const items = boardItems.length
      ? boardItems.map((item) => ({
          id: item.id,
          title: item.agent.name,
          type: item.agent.career7Type?.toLowerCase() ?? "learning",
          status: "in_progress",
          progress: 35,
        }))
      : starterItems;

    return NextResponse.json({
      garden: {
        items,
        activeCount: items.filter((item) => item.status === "in_progress").length,
        completedCount: items.filter((item) => item.status === "completed").length,
      },
      source: boardItems.length ? "growth-board" : "starter",
    });
  } catch (error) {
    console.error("[career7:learning-garden]", error);
    return NextResponse.json({ error: "Unable to load Learning Garden." }, { status: 500 });
  }
}
