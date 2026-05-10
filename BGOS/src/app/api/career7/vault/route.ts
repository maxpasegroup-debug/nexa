import { NextResponse } from "next/server";

import {
  getBlizzwayVault,
  sanitizeBlizzwayVaultPayload,
  saveBlizzwayVault,
} from "@/lib/blizzway-vault";
import { getCareer7Context } from "@/lib/career7-auth";

export async function GET(request: Request) {
  const authResult = await getCareer7Context(request);
  if (authResult.response) return authResult.response;

  const payload = await getBlizzwayVault(authResult.context);
  const hasVaultData =
    Object.keys(payload.onboardingAnswers).length > 0 ||
    payload.dreamGoals.length > 0 ||
    Boolean(payload.digitalProfile.stage || payload.digitalProfile.summary);

  return NextResponse.json({
    vault: {
      certificates: payload.dreamGoals.length,
      achievements: Object.keys(payload.onboardingAnswers).length,
      tier: "STARTER",
      vaultItems: hasVaultData
        ? [
            {
              id: "digital-profile",
              title: "Digital profile",
              type: "profile",
              issuedAt: payload.updatedAt || null,
              metadata: payload.digitalProfile,
            },
            {
              id: "dream-goals",
              title: "Dream goals",
              type: "goals",
              issuedAt: payload.updatedAt || null,
              metadata: { goals: payload.dreamGoals },
            },
            {
              id: "vision-board",
              title: "Vision board",
              type: "vision",
              issuedAt: payload.updatedAt || null,
              metadata: payload.visionBoard,
            },
          ]
        : [],
      onboardingAnswers: payload.onboardingAnswers,
      digitalProfile: payload.digitalProfile,
      dreamGoals: payload.dreamGoals,
      visionBoard: payload.visionBoard,
      updatedAt: payload.updatedAt,
    },
  });
}

export async function PUT(request: Request) {
  const authResult = await getCareer7Context(request);
  if (authResult.response) return authResult.response;

  const body = await request.json().catch(() => ({}));
  const payload = sanitizeBlizzwayVaultPayload(body);
  await saveBlizzwayVault({
    ...authResult.context,
    payload,
  });

  return NextResponse.json({ ok: true, vault: payload });
}
