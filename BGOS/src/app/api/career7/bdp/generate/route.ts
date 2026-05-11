import { NextResponse } from "next/server";

import { getCareer7Context } from "@/lib/career7-auth";
import { generateStarterBdp } from "@/lib/blizzway-nexa-engine";
import { completePathwayQuest } from "@/lib/blizzway-gamification";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const authResult = await getCareer7Context(request);
  if (authResult.response) return authResult.response;

  const bdp = await generateStarterBdp(authResult.context);
  await completePathwayQuest(authResult.context, "generate_bdp", { source: "bdp_generate" }).catch((error) => {
    console.error("[career7:bdp:generate:gamification]", error);
  });

  return NextResponse.json({ bdp });
}
