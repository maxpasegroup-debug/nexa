import type { Prisma } from "@prisma/client";

import { sendEmail } from "@/lib/email";
import { generateSummary } from "@/lib/nexa-chat";
import { findLeastLoadedSDE, getInternalBusiness, getString } from "@/lib/onboarding-flow";
import {
  dueInHours,
  getOwnedOnboardingSession,
  jsonError,
  requireSessionUser,
} from "@/lib/onboarding-session-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type StoredMessage = {
  role: string;
  content: string;
};

function asMessages(value: unknown): StoredMessage[] {
  return Array.isArray(value)
    ? value.filter(
        (message): message is StoredMessage =>
          message &&
          typeof message === "object" &&
          typeof (message as StoredMessage).role === "string" &&
          typeof (message as StoredMessage).content === "string",
      )
    : [];
}

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

    const messages = asMessages(session.messages);
    if (messages.length < 4) {
      return jsonError("Not enough information collected yet.");
    }

    const finalSummary = await generateSummary(messages, session.clientId || "");
    const internalBusiness = await getInternalBusiness();
    const sde = await findLeastLoadedSDE(internalBusiness?.id ?? user.businessId);
    if (!sde) return jsonError("No SDE available for assignment.", 503);

    const companyName =
      String(finalSummary.json.companyName || "") ||
      session.lead?.company ||
      session.lead?.name ||
      "Client";
    const summaryText = finalSummary.text;

    const [, task] = await prisma.$transaction([
      prisma.onboardingSession.update({
        where: { id: params.id },
        data: {
          status: "SUBMITTED",
          submittedAt: new Date(),
          selectedPlan,
          bdmNotes,
          sdeId: sde.id,
          summaryText,
          summaryJson: finalSummary.json as Prisma.InputJsonObject,
          generatedSummary: summaryText,
          generatedJson: finalSummary.json as Prisma.InputJsonObject,
          summaryGenerated: true,
          summaryGeneratedAt: new Date(),
          isComplete: true,
          completedAt: new Date(),
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
        html: `<p>${submittedByBoss ? `Boss ${user.name} submitted this onboarding. Treat as priority.` : "New workspace build request assigned to you."}</p><pre style="white-space:pre-wrap">${summaryText}</pre><p><a href="https://bgos.online/sde/workspaces">Open build dashboard</a></p>`,
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
              type: "NEW_BUILD_REQUEST",
              title: `New build request - ${companyName}`,
              content: `Onboarding submitted by ${user.name}. Summary ready in /sde/workspaces.`,
              message: `${submittedByBoss ? "Boss submitted priority build" : "New build request"} - ${companyName}, ${selectedPlan}. Assigned to ${sde.name}. Due in 24 hours.`,
              targetUserId: sde.id,
              priority: submittedByBoss ? "URGENT" : "HIGH",
              action: "Track onboarding",
            },
          })
        : Promise.resolve(null),
    ]);

    if (session.leadId) {
      await prisma.lead.update({
        where: { id: session.leadId },
        data: { bdmStatus: "ONBOARDING" },
      });
    }

    return Response.json({ success: true, sde, task, summary: summaryText });
  } catch (error) {
    console.error("[onboarding-session:submit]", error);
    return jsonError("Unable to submit onboarding session.", 500);
  }
}
