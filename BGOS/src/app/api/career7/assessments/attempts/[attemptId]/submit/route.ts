import { NextResponse } from "next/server";

import { submitAssessment } from "@/lib/blizzway-assessments";
import { getCareer7Context } from "@/lib/career7-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { attemptId: string } }) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;

    const result = await submitAssessment(authResult.context, params.attemptId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "ATTEMPT_NOT_FOUND") {
      return NextResponse.json({ error: "Assessment attempt not found." }, { status: 404 });
    }
    console.error("[career7:assessments:submit]", error);
    return NextResponse.json({ error: "Unable to submit assessment." }, { status: 500 });
  }
}
