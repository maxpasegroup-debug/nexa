import { NextResponse } from "next/server";

import { getCareer7Context } from "@/lib/career7-auth";
import { getGamificationState } from "@/lib/blizzway-gamification";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;

    return NextResponse.json({ gamification: await getGamificationState(authResult.context) });
  } catch (error) {
    console.error("[career7:pathway:gamification]", error);
    return NextResponse.json({ error: "Unable to load pathway gamification." }, { status: 500 });
  }
}
