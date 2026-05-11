import { NextResponse } from "next/server";

import {
  BLIZZWAY_ACHIEVEMENT_REWARDS,
  grantBlizzwayAchievementReward,
  type BlizzwayAchievementKey,
} from "@/lib/career7-wallet";
import { getCareer7Context } from "@/lib/career7-auth";

export const dynamic = "force-dynamic";

function isAchievementKey(value: unknown): value is BlizzwayAchievementKey {
  return typeof value === "string" && value in BLIZZWAY_ACHIEVEMENT_REWARDS;
}

export async function POST(request: Request) {
  const authResult = await getCareer7Context(request);
  if (authResult.response) return authResult.response;

  const body = (await request.json()) as {
    achievementKey?: string;
    entityId?: string;
  };

  if (!isAchievementKey(body.achievementKey)) {
    return NextResponse.json({ error: "Invalid achievementKey." }, { status: 400 });
  }

  const result = await grantBlizzwayAchievementReward({
    businessId: authResult.context.businessId,
    userId: authResult.context.userId,
    achievementKey: body.achievementKey,
    entityId: body.entityId,
  });

  return NextResponse.json({
    wallet: result.wallet,
    ledger: result.ledger,
    reward: BLIZZWAY_ACHIEVEMENT_REWARDS[body.achievementKey],
  });
}
