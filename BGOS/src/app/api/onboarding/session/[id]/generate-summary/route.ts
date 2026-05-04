import { Prisma } from "@prisma/client";

import {
  calculateCompleteness,
  generateFinalSummary,
} from "@/lib/nexa-onboarding-engine";
import {
  getOwnedOnboardingSession,
  jsonError,
  requireSessionUser,
} from "@/lib/onboarding-session-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { error, user } = await requireSessionUser(["BDM", "BOSS", "OWNER"]);
    if (error) return error;
    const session = await getOwnedOnboardingSession(
      params.id,
      user.id,
      user.role,
      user.businessId,
    );
    if (!session) return jsonError("Session not found.", 404);

    const completeness = calculateCompleteness(session);
    if (completeness.score < 60) {
      return jsonError(
        "Minimum 60% completeness required before summary generation.",
      );
    }

    const summary = await generateFinalSummary(params.id);
    await prisma.onboardingSession.update({
      where: { id: params.id },
      data: {
        completenessScore: completeness.score,
        completenessBreakdown: completeness.breakdown as Prisma.InputJsonValue,
        canSubmit: completeness.canSubmit,
        submissionBlocked: completeness.blocked,
        summaryText: summary.readable,
        summaryJson: summary.json,
        generatedSummary: summary.readable,
        generatedJson: summary.json,
        summaryGenerated: true,
        summaryGeneratedAt: new Date(),
        status: "READY",
      },
    });

    return Response.json({
      summary: {
        readable: summary.readable,
        structured: summary.json,
        score: summary.score,
      },
    });
  } catch (error) {
    console.error("[onboarding-session:summary]", error);
    return jsonError("Unable to generate onboarding summary.", 500);
  }
}
