import { NextResponse } from "next/server";

import { getCareer7Context } from "@/lib/career7-auth";
import { completePathwayQuest, getGamificationState } from "@/lib/blizzway-gamification";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: { questKey: string } },
) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;

    const body = await request.json().catch(() => ({}));
    const result = await completePathwayQuest(authResult.context, params.questKey, {
      source: "api",
      body,
    });

    return NextResponse.json({
      quest: {
        key: result.quest.key,
        title: result.quest.title,
        xpAwarded: result.progress.xpAwarded,
        completedAt: result.progress.completedAt.toISOString(),
        duplicate: result.duplicate,
      },
      achievement: result.achievement
        ? {
            key: result.achievement.achievementKey,
            status: result.achievement.status.toLowerCase(),
            rewardCredits: result.achievement.rewardCredits,
          }
        : null,
      levelProgress: result.levelProgress,
      gamification: await getGamificationState(authResult.context),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "QUEST_NOT_FOUND") {
      return NextResponse.json({ error: "Quest not found." }, { status: 404 });
    }

    console.error("[career7:pathway:quest:complete]", error);
    return NextResponse.json({ error: "Unable to complete pathway quest." }, { status: 500 });
  }
}
