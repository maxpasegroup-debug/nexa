import { NextResponse } from "next/server";

import { getCareer7Context } from "@/lib/career7-auth";
import {
  buildNexaRecommendations,
  generateStarterBdp,
  generateStarterPathway,
  getBlizzwayOnboardingProfile,
  saveBlizzwayOnboardingProfile,
} from "@/lib/blizzway-nexa-engine";
import { completePathwayQuest } from "@/lib/blizzway-gamification";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authResult = await getCareer7Context(request);
  if (authResult.response) return authResult.response;

  const [profile, recommendations] = await Promise.all([
    getBlizzwayOnboardingProfile(authResult.context),
    buildNexaRecommendations(authResult.context),
  ]);

  return NextResponse.json({
    onboarding: profile,
    status: profile?.completionStatus ?? "NOT_STARTED",
    recommendations,
  });
}

export async function POST(request: Request) {
  const authResult = await getCareer7Context(request);
  if (authResult.response) return authResult.response;

  const body = await request.json().catch(() => ({}));
  const onboarding = await saveBlizzwayOnboardingProfile(authResult.context, body);
  const [bdp, pathway, recommendations] = await Promise.all([
    generateStarterBdp(authResult.context),
    generateStarterPathway(authResult.context),
    buildNexaRecommendations(authResult.context),
  ]);
  if (onboarding.completionStatus === "COMPLETED") {
    await completePathwayQuest(authResult.context, "complete_onboarding", { source: "onboarding" }).catch((error) => {
      console.error("[career7:onboarding:gamification]", error);
    });
    await completePathwayQuest(authResult.context, "generate_bdp", { source: "onboarding_bdp" }).catch((error) => {
      console.error("[career7:onboarding:bdp:gamification]", error);
    });
  }

  return NextResponse.json({ onboarding, bdp, pathway, recommendations });
}
