import { NextResponse } from "next/server";

import { listResults } from "@/lib/blizzway-assessments";
import { getCareer7Context } from "@/lib/career7-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;
    return NextResponse.json({ results: await listResults(authResult.context) });
  } catch (error) {
    console.error("[career7:assessments:results]", error);
    return NextResponse.json({ error: "Unable to load assessment results." }, { status: 500 });
  }
}
