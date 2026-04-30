import { Prisma } from "@prisma/client";

import {
  checkSessionCompleteness,
  generateNexaGapQuestions,
  generateNexaSuggestions,
} from "@/lib/nexa-onboarding-intelligence";
import {
  asRecord,
  getOwnedOnboardingSession,
  jsonArray,
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
    const { error, user } = await requireSessionUser(["BDM"]);
    if (error) return error;

    const session = await getOwnedOnboardingSession(params.id, user.id, "BDM");
    if (!session) return jsonError("Session not found.", 404);

    const sessionData = {
      companyData: asRecord(session.companyData),
      employeeData: jsonArray(session.employeeData),
      pipelineData: jsonArray(session.pipelineData),
      operatingRules: jsonArray(session.operatingRules),
    };
    const completeness = checkSessionCompleteness(sessionData);
    const gaps = await generateNexaGapQuestions(
      sessionData,
      String((session.companyData as Record<string, unknown>)?.industry ?? "business"),
    );
    const suggestions = await generateNexaSuggestions(sessionData);
    const status = completeness.canSubmit
      ? "ready"
      : completeness.score >= 50
        ? "needs_attention"
        : "incomplete";

    await prisma.onboardingSession.update({
      where: { id: params.id },
      data: {
        completenessScore: completeness.score,
        nexaGaps: gaps as Prisma.InputJsonValue,
        nexaSuggestions: suggestions as Prisma.InputJsonValue,
        status: completeness.canSubmit ? "READY" : "GAP_FILLING",
      },
    });

    return Response.json({ completeness, gaps, suggestions, status });
  } catch (error) {
    console.error("[onboarding-session:analyze]", error);
    return jsonError("Unable to analyze onboarding session.", 500);
  }
}
