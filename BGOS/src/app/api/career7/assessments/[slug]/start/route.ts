import { NextResponse } from "next/server";

import { getAssessmentDetail, startAssessment } from "@/lib/blizzway-assessments";
import { getCareer7Context } from "@/lib/career7-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;

    const body = (await request.json().catch(() => ({}))) as { idempotencyKey?: string };
    const result = await startAssessment(authResult.context, params.slug, body.idempotencyKey);
    const assessment = await getAssessmentDetail(authResult.context, params.slug);

    return NextResponse.json({
      attempt: {
        id: result.attempt.id,
        status: result.attempt.status,
        creditsCharged: result.attempt.creditsCharged,
        duplicate: result.duplicate,
      },
      assessment,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json({ error: "Insufficient Blizzway credits for this assessment." }, { status: 402 });
    }
    if (message === "ASSESSMENT_NOT_FOUND") {
      return NextResponse.json({ error: "Assessment not found." }, { status: 404 });
    }
    console.error("[career7:assessments:start]", error);
    return NextResponse.json({ error: "Unable to start assessment." }, { status: 500 });
  }
}
