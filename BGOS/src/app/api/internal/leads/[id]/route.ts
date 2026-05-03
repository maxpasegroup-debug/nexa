import { NextResponse } from "next/server";

import { isEditableBdmLeadStatus } from "@/lib/bdm-lead-status";
import { startBossWorkLock } from "@/lib/boss-work-locks";
import { generateClientId } from "@/lib/client-id";
import { requireInternalOwnerApi } from "@/lib/internal-owner";
import { prisma } from "@/lib/prisma";

function str(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const context = await requireInternalOwnerApi();
  if ("error" in context) return context.error;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
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
      ...(isEditableBdmLeadStatus(bdmStatus) ? { bdmStatus } : {}),
      ...(Object.prototype.hasOwnProperty.call(body, "assignedTo") ? { assignedTo: assignedTo || null } : {}),
      ...(bdmStatus === "CONTACTED" || bdmStatus === "FOLLOW_UP" ? { lastContactedAt: new Date() } : {}),
      ...(bdmStatus === "LOST" ? { lostAt: new Date(), lostReason: str(body.lostReason) || null } : {}),
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

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const context = await requireInternalOwnerApi();
  if ("error" in context) return context.error;

  const lead = await prisma.lead.findFirst({
    where: { id: params.id, businessId: context.business.id },
    include: { onboardingSession: true },
  });
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });

  const lockTargetIds = [lead.id, lead.onboardingSession?.id].filter((value): value is string => Boolean(value));

  await prisma.$transaction([
    prisma.bossWorkLock.deleteMany({ where: { targetId: { in: lockTargetIds } } }),
    prisma.customerPortfolio.deleteMany({ where: { leadId: lead.id } }),
    prisma.commission.deleteMany({ where: { leadId: lead.id } }),
    prisma.callLog.deleteMany({ where: { leadId: lead.id } }),
    prisma.email.updateMany({ where: { leadId: lead.id }, data: { leadId: null } }),
    ...(lead.onboardingSession
      ? [prisma.onboardingSession.delete({ where: { id: lead.onboardingSession.id } })]
      : []),
    prisma.lead.delete({ where: { id: lead.id } }),
  ]);

  await prisma.activityLog.create({
    data: {
      businessId: context.business.id,
      userId: context.owner.id,
      action: "Lead permanently deleted by Boss",
      entity: "Lead",
      entityId: lead.id,
      meta: { leadName: lead.name, company: lead.company },
    },
  });

  return NextResponse.json({ success: true });
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
        clientId: await generateClientId(),
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
