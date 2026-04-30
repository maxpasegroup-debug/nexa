import crypto from "crypto";
import { NextResponse } from "next/server";

import { addHours } from "@/lib/onboarding-flow";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required." }, { status: 400 });
    }

    const lead = await prisma.onboardingLead.findFirst({
      where: { nexaSessionId: token, businessId: { not: null } },
      include: {
        workspaceConfig: true,
        business: { select: { id: true, name: true, healthScore: true } },
      },
    });

    if (!lead?.workspaceConfig) {
      return NextResponse.json(
        { error: "Workspace preview not found." },
        { status: 404 },
      );
    }

    await prisma.onboardingLead.update({
      where: { id: lead.id },
      data: { status: "BOSS_PREVIEWING" },
    });

    return NextResponse.json({
      workspaceConfig: lead.workspaceConfig,
      business: lead.business,
      lead: {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        companyName: lead.companyName,
        selectedPlan: lead.selectedPlan,
      },
      accessToken: crypto.randomBytes(32).toString("hex"),
      expiresAt: addHours(72).toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to load workspace preview." },
      { status: 500 },
    );
  }
}
