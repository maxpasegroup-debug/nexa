import { NextResponse } from "next/server";
import type { BDMLeadStatus, LeadStatus } from "@prisma/client";

import { startBossWorkLock } from "@/lib/boss-work-locks";
import { requireInternalOwnerApi } from "@/lib/internal-owner";
import { prisma } from "@/lib/prisma";

function str(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

const leadStatuses = ["NEW", "CONTACTED", "DEMO", "PROPOSAL", "WON", "LOST"];
const bdmStatuses = ["NEW", "CONTACTED", "FOLLOW_UP", "ONBOARDING", "LOST"];

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const context = await requireInternalOwnerApi();
  if ("error" in context) return context.error;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const status = str(body.status);
  const bdmStatus = str(body.bdmStatus);
  const assignedTo = str(body.assignedTo);

  const existing = await prisma.lead.findFirst({
    where: { id: params.id, businessId: context.business.id },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ error: "Lead not found." }, { status: 404 });

  const lead = await prisma.lead.update({
    where: { id: existing.id },
    data: {
      ...(str(body.name) ? { name: str(body.name) } : {}),
      ...(Object.prototype.hasOwnProperty.call(body, "company") ? { company: str(body.company) || null } : {}),
      ...(Object.prototype.hasOwnProperty.call(body, "phone") ? { phone: str(body.phone) || null } : {}),
      ...(Object.prototype.hasOwnProperty.call(body, "email") ? { email: str(body.email)?.toLowerCase() || null } : {}),
      ...(Object.prototype.hasOwnProperty.call(body, "notes") ? { notes: str(body.notes) || null } : {}),
      ...(Object.prototype.hasOwnProperty.call(body, "managementNotes") ? { managementNotes: str(body.managementNotes) || null } : {}),
      ...(typeof body.value === "number" ? { value: body.value } : {}),
      ...(leadStatuses.includes(status) ? { status: status as LeadStatus } : {}),
      ...(bdmStatuses.includes(bdmStatus) ? { bdmStatus: bdmStatus as BDMLeadStatus } : {}),
      ...(Object.prototype.hasOwnProperty.call(body, "assignedTo") ? { assignedTo: assignedTo || null } : {}),
      ...(bdmStatus === "CONTACTED" || bdmStatus === "FOLLOW_UP" ? { lastContactedAt: new Date() } : {}),
    },
  });

  await prisma.leadActivity.create({
    data: {
      leadId: lead.id,
      userId: context.owner.id,
      type: "BOSS_UPDATED",
      note: str(body.note) || `Boss updated lead. Status: ${lead.bdmStatus}.`,
    },
  });

  if (body.bossMode === true) {
    await startBossWorkLock(context.business.id, context.owner.id, {
      targetType: "LEAD",
      targetId: lead.id,
      targetRole: "BDM",
      targetUserId: lead.assignedTo,
      message: `Boss is managing lead ${lead.company || lead.name}. BDM must hold updates/messages until Boss finishes.`,
    });
  }

  return NextResponse.json({ lead });
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const context = await requireInternalOwnerApi();
  if ("error" in context) return context.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  if (str(body.action) !== "start_onboarding") {
    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  }

  const lead = await prisma.lead.findFirst({
    where: { id: params.id, businessId: context.business.id },
    include: { onboardingSession: true },
  });
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });

  const session = lead.onboardingSession ??
    await prisma.onboardingSession.create({
      data: {
        leadId: lead.id,
        bdmId: lead.assignedTo,
        status: "COLLECTING",
        companyData: {
          name: lead.company || lead.name,
          contactName: lead.name,
          email: lead.email,
          phone: lead.phone,
        },
      },
    });

  await prisma.lead.update({
    where: { id: lead.id },
    data: {
      bdmStatus: "ONBOARDING",
      onboardingStarted: true,
      onboardingSessionId: session.id,
    },
  });

  await startBossWorkLock(context.business.id, context.owner.id, {
    targetType: "ONBOARDING_SESSION",
    targetId: session.id,
    targetRole: "BDM",
    targetUserId: lead.assignedTo,
    message: `Boss started onboarding for ${lead.company || lead.name}. BDM must not message/update until Boss finishes.`,
  });

  return NextResponse.json({ sessionId: session.id });
}
