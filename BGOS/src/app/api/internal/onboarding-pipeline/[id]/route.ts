import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { requireInternalOwnerApi } from "@/lib/internal-owner";
import { getString } from "@/lib/onboarding-flow";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statuses = new Set([
  "NEW",
  "BDM_ASSIGNED",
  "BDM_CONTACTED",
  "BDM_SUBMITTED",
  "SDE_BUILDING",
  "SDE_DELIVERED",
  "BOSS_PREVIEWING",
  "TRIAL_ACTIVE",
  "CONVERTED",
  "CANCELLED",
  "LOST",
]);

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const authResult = await requireInternalOwnerApi();
    if ("error" in authResult) return authResult.error;

    const body = (await request.json()) as Record<string, unknown>;
    const assignedBDMId = getString(body.assignedBDMId);
    const assignedSDEId = getString(body.assignedSDEId);
    const status = getString(body.status);
    const note = getString(body.note);

    const data: Prisma.OnboardingLeadUpdateInput = {};

    if (Object.prototype.hasOwnProperty.call(body, "assignedBDMId")) {
      data.assignedBDM = assignedBDMId
        ? { connect: { id: assignedBDMId } }
        : { disconnect: true };
      if (assignedBDMId && !status) data.status = "BDM_ASSIGNED";
    }

    if (Object.prototype.hasOwnProperty.call(body, "assignedSDEId")) {
      data.assignedSDE = assignedSDEId
        ? { connect: { id: assignedSDEId } }
        : { disconnect: true };
      if (assignedSDEId && !status) data.status = "SDE_BUILDING";
    }

    if (status) {
      if (!statuses.has(status)) {
        return NextResponse.json({ error: "Invalid status." }, { status: 400 });
      }
      data.status = status as never;
    }

    if (note) {
      const existing = await prisma.onboardingLead.findUnique({
        where: { id: params.id },
        select: { bdmNotes: true },
      });
      data.bdmNotes = [existing?.bdmNotes, `[OWNER ${new Date().toISOString()}] ${note}`]
        .filter(Boolean)
        .join("\n\n");
    }

    const lead = await prisma.onboardingLead.update({
      where: { id: params.id },
      data,
      include: {
        assignedBDM: { select: { id: true, name: true, email: true } },
        assignedSDE: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ lead });
  } catch (error) {
    console.error("[internal:onboarding-pipeline:update]", error);
    return NextResponse.json(
      { error: "Unable to update onboarding lead." },
      { status: 500 },
    );
  }
}
