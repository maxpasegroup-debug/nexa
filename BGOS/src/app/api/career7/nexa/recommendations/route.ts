import { NextResponse } from "next/server";

import { getCareer7Context } from "@/lib/career7-auth";
import { buildNexaRecommendations } from "@/lib/blizzway-nexa-engine";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authResult = await getCareer7Context(request);
  if (authResult.response) return authResult.response;

  return NextResponse.json({ recommendations: await buildNexaRecommendations(authResult.context) });
}
