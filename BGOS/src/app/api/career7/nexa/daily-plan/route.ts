import { NextResponse } from "next/server";

import { buildDailyPlan } from "@/lib/blizzway-nexa-advanced";
import { getCareer7Context } from "@/lib/career7-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;
    return NextResponse.json(await buildDailyPlan(authResult.context));
  } catch (error) {
    console.error("[career7:nexa:daily-plan]", error);
    return NextResponse.json({ error: "Unable to generate NEXA daily plan." }, { status: 500 });
  }
}
