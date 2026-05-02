import { NextResponse } from "next/server";

import { getString } from "@/lib/onboarding-flow";
import {
  getOwnedOnboardingSession,
  jsonError,
  requireSessionUser,
} from "@/lib/onboarding-session-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { error, user } = await requireSessionUser(["BDM"]);
    if (error) return error;

    const body = (await request.json()) as Record<string, unknown>;
    const leadId = getString(body.leadId);
    if (!leadId) return jsonError("leadId is required.");

    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        OR: [{ assignedTo: user.id }, { createdBy: user.id }],
      },
    });

    if (!lead) return jsonError("Lead not found.", 404);

    const session = await prisma.onboardingSession.upsert({
      where: { leadId },
      create: {
        leadId,
        bdmId: user.id,
        status: "COLLECTING",
        companyData: {
          name: lead.company ?? lead.name,
          industry: "",
          contactName: lead.name,
          email: lead.email,
          phone: lead.phone,
        },
      },
      update: {
        bdmId: user.id,
        status: "COLLECTING",
      },
      select: { id: true },
    });

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        onboardingStarted: true,
        onboardingSessionId: session.id,
        bdmStatus: "ONBOARDING",
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("[onboarding-session:create]", error);
    return jsonError("Unable to create onboarding session.", 500);
  }
}

export async function GET(request: Request) {
  try {
    const { error, user } = await requireSessionUser(["BDM", "SDE", "OWNER"]);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId") ?? "";
    if (!sessionId) return jsonError("sessionId is required.");

    const session =
      user.role === "OWNER"
        ? await prisma.onboardingSession.findUnique({
            where: { id: sessionId },
            include: {
              lead: true,
              bdm: { select: { id: true, name: true, email: true } },
              sde: { select: { id: true, name: true, email: true } },
              employees: true,
              clarifications: {
                include: {
                  raiser: { select: { id: true, name: true, email: true } },
                  answerer: { select: { id: true, name: true, email: true } },
                },
                orderBy: { createdAt: "desc" },
              },
            },
          })
        : await getOwnedOnboardingSession(sessionId, user.id, user.role);

    if (!session) return jsonError("Session not found.", 404);

    return NextResponse.json({ session });
  } catch (error) {
    console.error("[onboarding-session:get]", error);
    return jsonError("Unable to fetch onboarding session.", 500);
  }
}
