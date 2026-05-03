import { sendEmail } from "@/lib/email";
import { calculateCompleteness, generateFinalSummary } from "@/lib/nexa-onboarding-engine";
import { findLeastLoadedSDE, getInternalBusiness, getString } from "@/lib/onboarding-flow";
import {
  dueInHours,
  getOwnedOnboardingSession,
  jsonError,
  requireSessionUser,
} from "@/lib/onboarding-session-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { error, user } = await requireSessionUser(["BDM", "OWNER"]);
    if (error) return error;
    if (!user.businessId) return jsonError("Business not found.", 400);

    const submittedByBoss = user.role === "OWNER";
    const session = await getOwnedOnboardingSession(params.id, user.id, user.role);
    if (!session) return jsonError("Session not found.", 404);

    const body = (await request.json()) as Record<string, unknown>;
    const selectedPlan = getString(body.selectedPlan) || session.selectedPlan || "GROWTH";
    const rawBdmNotes = getString(body.bdmNotes);
    const bdmNotes = submittedByBoss
      ? `[Submitted by Boss: ${user.name}]\n${rawBdmNotes}`.trim()
      : rawBdmNotes;

    const completeness = calculateCompleteness(session);
    if (!completeness.canSubmit) {
      return jsonError(
        completeness.blocked ?? "Complete all required onboarding data before submission.",
      );
    }
    if (!session.summaryText || !session.summaryJson || !session.summaryGenerated) {
      return jsonError("Generate the NEXA build-ready summary before submitting to SDE.");
    }

    await prisma.onboardingSession.update({
      where: { id: params.id },
      data: { selectedPlan, bdmNotes },
    });
    const finalSummary = await generateFinalSummary(params.id);

    const internalBusiness = await getInternalBusiness();
    const sde = await findLeastLoadedSDE(internalBusiness?.id ?? user.businessId);
    if (!sde) return jsonError("No SDE available for assignment.", 503);

    const companyName =
      String((session.companyData as Record<string, unknown>)?.name ?? "") ||
      session.lead?.company ||
      session.lead?.name ||
      "Client";
    const summaryText = finalSummary.readable;

    const [, task] = await prisma.$transaction([
      prisma.onboardingSession.update({
        where: { id: params.id },
        data: {
          status: "SUBMITTED",
          submittedAt: new Date(),
          selectedPlan,
          bdmNotes,
          sdeId: sde.id,
          completenessScore: completeness.score,
          completenessBreakdown: completeness.breakdown,
          canSubmit: true,
          submissionBlocked: null,
          summaryText: finalSummary.readable,
          summaryJson: finalSummary.json,
          generatedSummary: finalSummary.readable,
          generatedJson: finalSummary.json,
        },
      }),
      prisma.task.create({
        data: {
          title: `${submittedByBoss ? "PRIORITY: Boss submitted - " : "Build workspace - "}${companyName}`,
          priority: submittedByBoss ? "URGENT" : "HIGH",
          description: submittedByBoss
            ? `Submitted by Boss: ${user.name}\n\n${summaryText}`
            : summaryText,
          dueDate: dueInHours(24),
          assignedTo: sde.id,
        },
      }),
    ]);

    await Promise.allSettled([
      sendEmail({
        to: sde.email,
        toName: sde.name,
        subject: `${submittedByBoss ? "PRIORITY: Boss submitted - " : "Build workspace - "}${companyName}`,
        html: `<p>${submittedByBoss ? `Boss ${user.name} submitted this onboarding. Treat as priority.` : "New workspace build request assigned to you."}</p><pre style="white-space:pre-wrap">${summaryText}</pre><p><a href="https://iceconnect.in/sde/workspaces">Open build dashboard</a></p>`,
      }),
      sendEmail({
        to: user.email,
        toName: user.name,
        subject: `Onboarding submitted - ${companyName}`,
        html: `<p>Your onboarding summary for <strong>${companyName}</strong> has been submitted to ${sde.name}.</p>`,
      }),
      internalBusiness
        ? prisma.nexaInsight.create({
            data: {
              businessId: internalBusiness.id,
              type: "action",
                message: `${submittedByBoss ? "Boss submitted priority build" : "New build request"} - ${companyName}, ${selectedPlan}. Assigned to ${sde.name}. Due in 24 hours.`,
              action: "Track onboarding",
            },
          })
        : Promise.resolve(null),
    ]);

    return Response.json({ success: true, sde, task });
  } catch (error) {
    console.error("[onboarding-session:submit]", error);
    return jsonError("Unable to submit onboarding session.", 500);
  }
}
