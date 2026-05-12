import { NextResponse } from "next/server";

import { sanitizeAnswerValue, saveAssessmentAnswer } from "@/lib/blizzway-assessments";
import { getCareer7Context } from "@/lib/career7-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { attemptId: string } }) {
  try {
    const authResult = await getCareer7Context(request);
    if (authResult.response) return authResult.response;

    const body = (await request.json()) as { questionId?: string; value?: unknown };
    if (!body.questionId) {
      return NextResponse.json({ error: "questionId is required." }, { status: 400 });
    }

    const answer = await saveAssessmentAnswer(
      authResult.context,
      params.attemptId,
      body.questionId,
      sanitizeAnswerValue(body.value),
    );

    return NextResponse.json({ answer: { id: answer.id, questionId: answer.questionId, score: answer.score } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "ATTEMPT_NOT_FOUND" || message === "QUESTION_NOT_FOUND") {
      return NextResponse.json({ error: "Assessment attempt or question not found." }, { status: 404 });
    }
    console.error("[career7:assessments:answer]", error);
    return NextResponse.json({ error: "Unable to save assessment answer." }, { status: 500 });
  }
}
