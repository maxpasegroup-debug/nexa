import { sendEmail } from "@/lib/email";
import { checkSessionCompleteness } from "@/lib/nexa-onboarding-intelligence";
import { findLeastLoadedSDE, getInternalBusiness, getString } from "@/lib/onboarding-flow";
import {
  asRecord,
  dueInHours,
  getOwnedOnboardingSession,
  jsonArray,
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
    const { error, user } = await requireSessionUser(["BDM"]);
    if (error) return error;
    if (!user.businessId) return jsonError("BDM business not found.", 400);

    const session = await getOwnedOnboardingSession(params.id, user.id, "BDM");
    if (!session) return jsonError("Session not found.", 404);

    const body = (await request.json()) as Record<string, unknown>;
    const selectedPlan = getString(body.selectedPlan) || session.selectedPlan || "GROWTH";
    const bdmNotes = getString(body.bdmNotes);

    const sessionData = {
      companyData: asRecord(session.companyData),
      employeeData: jsonArray(session.employeeData),
      pipelineData: jsonArray(session.pipelineData),
      operatingRules: jsonArray(session.operatingRules),
    };
    const completeness = checkSessionCompleteness(sessionData);
    if (completeness.score <= 80) {
      return jsonError("Completeness score must be above 80 before submission.");
    }

    const internalBusiness = await getInternalBusiness();
    const sde = await findLeastLoadedSDE(internalBusiness?.id ?? user.businessId);
    if (!sde) return jsonError("No SDE available for assignment.", 503);

    const companyName =
      String((session.companyData as Record<string, unknown>)?.name ?? "") ||
      session.lead?.company ||
      session.lead?.name ||
      "Client";
    const summaryText =
      session.summaryText ??
      `BGOS ONBOARDING SUMMARY\nClient: ${companyName}\nPlan: ${selectedPlan}`;

    const [, task] = await prisma.$transaction([
      prisma.onboardingSession.update({
        where: { id: params.id },
        data: {
          status: "SDE_BUILDING",
          submittedAt: new Date(),
          selectedPlan,
          bdmNotes,
          sdeId: sde.id,
          completenessScore: completeness.score,
        },
      }),
      prisma.task.create({
        data: {
          title: `Build workspace - ${companyName}`,
          priority: "HIGH",
          description: summaryText,
          dueDate: dueInHours(24),
          assignedTo: sde.id,
        },
      }),
    ]);

    await Promise.allSettled([
      sendEmail({
        to: sde.email,
        toName: sde.name,
        subject: `Build workspace - ${companyName}`,
        html: `<p>New workspace build request assigned to you.</p><pre style="white-space:pre-wrap">${summaryText}</pre><p><a href="https://iceconnect.in/sde/workspaces">Open build dashboard</a></p>`,
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
              message: `New build request - ${companyName}, ${selectedPlan}. Assigned to ${sde.name}. Due in 24 hours.`,
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
