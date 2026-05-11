import { NextResponse } from "next/server";

import { getCareer7Context } from "@/lib/career7-auth";
import { getGamificationState } from "@/lib/blizzway-gamification";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;

    const state = await getGamificationState(authResult.context);
    return NextResponse.json({ streak: state.streak });
  } catch (error) {
    console.error("[career7:pathway:streaks]", error);
    return NextResponse.json({ error: "Unable to load pathway streak." }, { status: 500 });
  }
}
