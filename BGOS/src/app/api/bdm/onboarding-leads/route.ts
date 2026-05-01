import { NextResponse } from "next/server";

import { requireRole } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const authResult = await requireRole("BDM");
    if (authResult.response) {
      return authResult.response;
    }

    const leads = await prisma.onboardingLead.findMany({
      where: { assignedBDMId: authResult.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        assignedSDE: { select: { id: true, name: true, email: true } },
      },
    });

    const unsubmittedCount = leads.filter((lead) =>
      ["BDM_ASSIGNED", "BDM_CONTACTED"].includes(lead.status),
    ).length;

    return NextResponse.json({ leads, unsubmittedCount });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch onboarding leads." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const authResult = await requireRole("BDM");
    if (authResult.response) {
      return authResult.response;
    }

    const body = (await request.json()) as {
      onboardingLeadId?: unknown;
      status?: unknown;
    };

    if (
      typeof body.onboardingLeadId !== "string" ||
      body.status !== "BDM_CONTACTED"
    ) {
      return NextResponse.json(
        { error: "onboardingLeadId and valid status are required." },
        { status: 400 },
      );
    }

    const lead = await prisma.onboardingLead.updateMany({
      where: {
        id: body.onboardingLeadId,
        assignedBDMId: authResult.user.id,
        status: { in: ["BDM_ASSIGNED", "BDM_CONTACTED"] },
      },
      data: { status: "BDM_CONTACTED" },
    });

    if (lead.count === 0) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    const updated = await prisma.onboardingLead.findUnique({
      where: { id: body.onboardingLeadId },
      include: {
        assignedSDE: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ lead: updated });
  } catch {
    return NextResponse.json(
      { error: "Unable to update onboarding lead." },
      { status: 500 },
    );
  }
}
