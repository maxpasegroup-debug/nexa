import { Prisma } from "@prisma/client";

import {
  checkSessionCompleteness,
  generateOnboardingSummary,
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
    if (completeness.score <= 80) {
      return jsonError("Completeness score must be above 80 before summary generation.");
    }

    const summary = await generateOnboardingSummary(sessionData);
    await prisma.onboardingSession.update({
      where: { id: params.id },
      data: {
        completenessScore: completeness.score,
        summaryText: summary.readable,
        summaryJson: summary.structured as Prisma.InputJsonValue,
        summaryGenerated: true,
        selectedPlan: summary.recommendedPlan,
        planReason: summary.planReason,
        status: "READY",
      },
    });

    return Response.json({ summary });
  } catch (error) {
    console.error("[onboarding-session:summary]", error);
    return jsonError("Unable to generate onboarding summary.", 500);
  }
}
