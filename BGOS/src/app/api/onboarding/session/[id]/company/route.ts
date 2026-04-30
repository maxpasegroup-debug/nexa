import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import {
  asRecord,
  getOwnedOnboardingSession,
  jsonError,
  requireSessionUser,
} from "@/lib/onboarding-session-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
    const companyData = asRecord(body.companyData);
    if (!Object.keys(companyData).length) return jsonError("companyData is required.");
    const operatingRules = Array.isArray(companyData.operatingRules)
      ? companyData.operatingRules
      : undefined;

    const updated = await prisma.onboardingSession.update({
      where: { id: params.id },
      data: {
        companyData: companyData as Prisma.InputJsonValue,
        ...(operatingRules ? { operatingRules: operatingRules as Prisma.InputJsonValue } : {}),
      },
      include: { employees: true, clarifications: true, lead: true },
    });

    return NextResponse.json({ session: updated });
  } catch (error) {
    console.error("[onboarding-session:company]", error);
    return NextResponse.json(
      { error: "Unable to update company data." },
      { status: 500 },
    );
  }
}
