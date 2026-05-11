import { NextResponse } from "next/server";

import { getCareer7Context } from "@/lib/career7-auth";
import { claimAchievementReward, getGamificationState } from "@/lib/blizzway-gamification";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: { achievementKey: string } },
) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;

    const result = await claimAchievementReward(authResult.context, params.achievementKey);

    return NextResponse.json({
      achievement: {
        key: result.achievement.key,
        title: result.achievement.title,
        rewardCredits: result.achievement.rewardCredits,
        status: result.userAchievement.status.toLowerCase(),
        claimedAt: result.userAchievement.claimedAt?.toISOString() ?? null,
        duplicate: result.duplicate,
      },
      ledger: result.ledger
        ? {
            id: result.ledger.id,
            amount: result.ledger.amount,
            balanceAfter: result.ledger.balanceAfter,
            description: result.ledger.description,
          }
        : null,
      gamification: await getGamificationState(authResult.context),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "ACHIEVEMENT_NOT_UNLOCKED") {
      return NextResponse.json({ error: "Achievement is not unlocked yet." }, { status: 409 });
    }

    console.error("[career7:pathway:achievement:claim]", error);
    return NextResponse.json({ error: "Unable to claim achievement reward." }, { status: 500 });
  }
}
