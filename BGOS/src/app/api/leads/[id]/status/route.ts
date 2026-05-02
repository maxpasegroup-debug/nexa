import { NextResponse } from "next/server";

import { getCrmContext } from "@/lib/leads/server";
import { analyseNotes } from "@/lib/nexa-bdm-analysis";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    id: string;
  };
};

const bdmLeadStatuses = ["NEW", "CONTACTED", "FOLLOW_UP", "ONBOARDING", "LOST"] as const;

function isBdmLeadStatus(value: unknown): value is (typeof bdmLeadStatuses)[number] {
  return typeof value === "string" && bdmLeadStatuses.includes(value as (typeof bdmLeadStatuses)[number]);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const context = await getCrmContext();
    if (context.error) return context.error;

    const body = (await request.json()) as Record<string, unknown>;
    const bdmStatus = body.bdmStatus;

    if (!isBdmLeadStatus(bdmStatus)) {
      return NextResponse.json({ error: "Valid bdmStatus is required." }, { status: 400 });
    }

    const lostReason = typeof body.lostReason === "string" ? body.lostReason.trim() : "";
    if (bdmStatus === "LOST" && !lostReason) {
      return NextResponse.json({ error: "lostReason is required when lead is lost." }, { status: 400 });
    }

    const existingLead = await prisma.lead.findFirst({
      where: {
        id: params.id,
        businessId: context.businessId,
      },
      select: { id: true, assignedTo: true, bdmStatus: true },
    });

    if (!existingLead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    const now = new Date();
    const updatedLead = await prisma.lead.update({
      where: { id: existingLead.id },
      data: {
        bdmStatus,
        ...(bdmStatus === "CONTACTED" || bdmStatus === "FOLLOW_UP"
          ? { lastContactedAt: now }
          : {}),
        ...(bdmStatus === "LOST" ? { lostReason } : {}),
        ...(bdmStatus === "ONBOARDING" ? { onboardingStarted: true } : {}),
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, role: true },
        },
        callNotes: {
          orderBy: { createdAt: "desc" },
          include: { author: { select: { id: true, name: true } } },
        },
      },
    });

    if (bdmStatus !== existingLead.bdmStatus) {
      await prisma.leadActivity.create({
        data: {
          leadId: existingLead.id,
          userId: context.user.id,
          type: "bdm_status_change",
          note: `BDM status changed from ${existingLead.bdmStatus} to ${bdmStatus}`,
        },
      });

      void Promise.allSettled([analyseNotes(updatedLead.assignedTo ?? context.user.id)]);
    }

    return NextResponse.json({ lead: updatedLead });
  } catch (error) {
    console.error("[lead-status:update]", error);
    return NextResponse.json({ error: "Unable to update lead status." }, { status: 500 });
  }
}
