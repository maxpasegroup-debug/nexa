import { NextResponse } from "next/server";

import { getAssessmentDetail } from "@/lib/blizzway-assessments";
import { getCareer7Context } from "@/lib/career7-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;

    const assessment = await getAssessmentDetail(authResult.context, params.slug);
    if (!assessment) return NextResponse.json({ error: "Assessment not found." }, { status: 404 });

    return NextResponse.json({ assessment });
  } catch (error) {
    console.error("[career7:assessments:detail]", error);
    return NextResponse.json({ error: "Unable to load assessment." }, { status: 500 });
  }
}
