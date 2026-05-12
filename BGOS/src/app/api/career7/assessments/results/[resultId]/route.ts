import { NextResponse } from "next/server";

import { getResult } from "@/lib/blizzway-assessments";
import { getCareer7Context } from "@/lib/career7-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { resultId: string } }) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;
    const result = await getResult(authResult.context, params.resultId);
    if (!result) return NextResponse.json({ error: "Assessment result not found." }, { status: 404 });
    return NextResponse.json({ result });
  } catch (error) {
    console.error("[career7:assessments:result]", error);
    return NextResponse.json({ error: "Unable to load assessment result." }, { status: 500 });
  }
}
