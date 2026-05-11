import { NextResponse } from "next/server";

import { getCareer7Context } from "@/lib/career7-auth";
import { checkInPathwayStreak, getGamificationState } from "@/lib/blizzway-gamification";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;

    const result = await checkInPathwayStreak(authResult.context);

    return NextResponse.json({
      streak: {
        currentCount: result.streak.currentCount,
        longestCount: result.streak.longestCount,
        lastCheckInKey: result.streak.lastCheckInKey,
        duplicate: result.duplicate,
      },
      quest: result.questResult
        ? {
            key: result.questResult.quest.key,
            duplicate: result.questResult.duplicate,
          }
        : null,
      gamification: await getGamificationState(authResult.context),
    });
  } catch (error) {
    console.error("[career7:pathway:streaks:check-in]", error);
    return NextResponse.json({ error: "Unable to check in pathway streak." }, { status: 500 });
  }
}
