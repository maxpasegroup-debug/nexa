import { sendEmail } from "@/lib/email";
import { getString } from "@/lib/onboarding-flow";
import {
  getOwnedOnboardingSession,
  jsonError,
  requireSessionUser,
} from "@/lib/onboarding-session-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { error, user } = await requireSessionUser(["BDM", "SDE", "BOSS", "OWNER"]);
    if (error) return error;
    const session = await getOwnedOnboardingSession(
      params.id,
      user.id,
      user.role,
      user.businessId,
    );
    if (!session) return jsonError("Session not found.", 404);

    return Response.json({ clarifications: session.clarifications });
  } catch (error) {
    console.error("[onboarding-session:clarification:list]", error);
    return jsonError("Unable to fetch clarifications.", 500);
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { error, user } = await requireSessionUser(["BDM", "SDE"]);
    if (error) return error;
    const session = await getOwnedOnboardingSession(params.id, user.id, user.role);
    if (!session) return jsonError("Session not found.", 404);

    const body = (await request.json()) as Record<string, unknown>;
    const question = getString(body.question);
    const context = getString(body.context);
    if (!question) return jsonError("question is required.");

    const clarification = await prisma.onboardingClarification.create({
      data: {
        sessionId: params.id,
        raisedBy: user.id,
        question,
        context: context || undefined,
        notifiedAt: new Date(),
      },
    });
    const companyName =
      String((session.companyData as Record<string, unknown>)?.name ?? "") ||
      session.lead?.company ||
      session.lead?.name ||
      "Client";

    await Promise.allSettled([
      session.bdm
        ? sendEmail({
            to: session.bdm.email,
            toName: session.bdm.name,
            subject: `SDE needs clarification on ${companyName} build`,
            html: `<p><strong>Question:</strong> ${question}</p><p>${context}</p>`,
          })
        : Promise.resolve(false),
      session.bdm?.businessId
        ? prisma.nexaInsight.create({
            data: {
              businessId: session.bdm.businessId,
              type: "warning",
              message: `SDE needs clarification on ${companyName}: ${question}`,
              action: "Answer clarification",
            },
          })
        : Promise.resolve(null),
    ]);

    return Response.json({ clarificationId: clarification.id, clarification });
  } catch (error) {
    console.error("[onboarding-session:clarification:create]", error);
    return jsonError("Unable to create clarification.", 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { error, user } = await requireSessionUser(["BDM"]);
    if (error) return error;
    const session = await getOwnedOnboardingSession(params.id, user.id, "BDM");
    if (!session) return jsonError("Session not found.", 404);

    const body = (await request.json()) as Record<string, unknown>;
    const clarificationId = getString(body.clarificationId);
    const answer = getString(body.answer);
    if (!clarificationId || !answer) {
      return jsonError("clarificationId and answer are required.");
    }

    const clarification = await prisma.onboardingClarification.update({
      where: { id: clarificationId, sessionId: params.id },
      data: {
        answeredBy: user.id,
        answer,
        answeredAt: new Date(),
        status: "answered",
      },
      include: {
        raiser: { select: { id: true, name: true, email: true } },
      },
    });

    await sendEmail({
      to: clarification.raiser.email,
      toName: clarification.raiser.name,
      subject: "Clarification answered",
      html: `<p><strong>Question:</strong> ${clarification.question}</p><p><strong>Answer:</strong> ${answer}</p>`,
    });

    return Response.json({ clarification });
  } catch (error) {
    console.error("[onboarding-session:clarification:answer]", error);
    return jsonError("Unable to answer clarification.", 500);
  }
}
