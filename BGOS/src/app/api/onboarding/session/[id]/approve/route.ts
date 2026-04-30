import { sendEmail } from "@/lib/email";
import { buildWorkspaceFromConfig } from "@/lib/build-workspace-from-config";
import { previewUrl } from "@/lib/onboarding-flow";
import {
  getOwnedOnboardingSession,
  jsonError,
  requireSessionUser,
} from "@/lib/onboarding-session-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function companyNameFrom(session: NonNullable<Awaited<ReturnType<typeof getOwnedOnboardingSession>>>) {
  const summary = session.summaryJson as { company?: { name?: string } } | null;
  const company = session.companyData as Record<string, unknown>;
  return (
    summary?.company?.name ||
    String(company?.name ?? "") ||
    session.lead?.company ||
    session.lead?.name ||
    "Client workspace"
  );
}

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { error, user } = await requireSessionUser(["SDE"]);
    if (error) return error;

    const session = await getOwnedOnboardingSession(params.id, user.id, "SDE");
    if (!session) return jsonError("Session not found.", 404);
    if (!session.summaryJson || !session.summaryText) {
      return jsonError("Generate a summary before approval.");
    }

    await prisma.onboardingSession.update({
      where: { id: session.id },
      data: {
        status: "SDE_APPROVED",
        approvedAt: new Date(),
        approvedBy: user.id,
        buildStatus: "approved",
      },
    });

    const built = await buildWorkspaceFromConfig(session.id);
    const previewLink = previewUrl(built.previewToken);
    const companyName = companyNameFrom(session);
    const bossEmail = session.lead?.email?.toLowerCase();
    const bossName = session.lead?.name ?? companyName;

    await Promise.allSettled([
      session.bdm
        ? sendEmail({
            to: session.bdm.email,
            toName: session.bdm.name,
            subject: `${companyName} workspace approved and ready for delivery`,
            html: `<p>${companyName} workspace is approved and ready for delivery. Schedule the delivery call with the client.</p>`,
          })
        : Promise.resolve(false),
      bossEmail
        ? sendEmail({
            to: bossEmail,
            toName: bossName,
            subject: `${companyName} - Your workspace is ready`,
            html: `
              <div style="font-family:Arial,sans-serif;line-height:1.7">
                <h1>Your BGOS workspace is ready</h1>
                <p>Hi ${bossName},</p>
                <p>We built your ${companyName} workspace from the onboarding brief.</p>
                <p><strong>Recommended plan:</strong> ${session.selectedPlan ?? "GROWTH"}</p>
                <p><a href="${previewLink}" style="display:inline-block;background:#7C6FFF;color:white;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold;">Preview your workspace</a></p>
              </div>
            `,
          })
        : Promise.resolve(false),
    ]);

    return Response.json({
      previewToken: built.previewToken,
      previewUrl: previewLink,
      businessId: built.businessId,
    });
  } catch (error) {
    console.error("[onboarding-session:approve]", error);
    return jsonError("Unable to approve onboarding session.", 500);
  }
}
