import { NextResponse } from "next/server";

import { transitionBusinessStatus } from "@/lib/business-status";
import { sendEmail } from "@/lib/email";
import { requireInternalOwnerApi } from "@/lib/internal-owner";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const context = await requireInternalOwnerApi();
  if ("error" in context) return context.error;
  const body = (await request.json().catch(() => ({}))) as { reason?: string };
  const reason = body.reason?.trim() || "Offboarded by BGOS owner";

  const business = await prisma.business.findUnique({
    where: { id: params.id },
    include: {
      users: true,
      leads: true,
      pipelines: true,
      nexaActions: true,
      nexaMemory: true,
      activityLogs: true,
    },
  });
  if (!business) return NextResponse.json({ error: "Customer not found." }, { status: 404 });

  const exportRecord = await prisma.customerDataExport.create({
    data: {
      businessId: business.id,
      reason,
      expiresAt: new Date(Date.now() + 90 * 86400000),
      payload: {
        business,
        leads: business.leads,
        pipelines: business.pipelines,
        nexaActions: business.nexaActions,
        nexaMemory: business.nexaMemory,
      },
    },
  });

  await prisma.$transaction([
    prisma.business.update({ where: { id: params.id }, data: { notes: reason } }),
    prisma.user.updateMany({ where: { businessId: params.id }, data: { active: false, status: "ARCHIVED" } }),
    prisma.trialSubscription.updateMany({ where: { businessId: params.id }, data: { status: "CANCELLED", cancelledAt: new Date(), cancelReason: reason } }),
    prisma.nexaInsight.create({
      data: {
        businessId: context.business.id,
        type: "warning",
        message: `${business.name} offboarded — ${reason}`,
        action: "Customer offboarded",
      },
    }),
  ]);
  await transitionBusinessStatus(params.id, "OFFBOARDED", reason);

  const boss = business.users.find((user) => user.role === "BOSS");
  if (boss) {
    await sendEmail({
      to: boss.email,
      toName: boss.name,
      subject: "Your BGOS workspace has been offboarded",
      html: "<p>Your BGOS workspace has been offboarded. Contact BGOS for any final support.</p>",
    }).catch(() => false);
  }

  return NextResponse.json({
    success: true,
    exportDownloadLink: `/api/internal/customers/${business.id}/exports/${exportRecord.id}`,
  });
}
