import { NextResponse } from "next/server";

import { recommendAssessments } from "@/lib/blizzway-assessments";
import { getCareer7Context } from "@/lib/career7-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;
    return NextResponse.json({ recommendations: await recommendAssessments(authResult.context) });
  } catch (error) {
    console.error("[career7:assessments:recommendations]", error);
    return NextResponse.json({ error: "Unable to load assessment recommendations." }, { status: 500 });
  }
}
