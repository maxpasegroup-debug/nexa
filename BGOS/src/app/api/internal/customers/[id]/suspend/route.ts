import { NextResponse } from "next/server";

import { transitionBusinessStatus } from "@/lib/business-status";
import { sendEmail } from "@/lib/email";
import { requireInternalOwnerApi } from "@/lib/internal-owner";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const context = await requireInternalOwnerApi();
  if ("error" in context) return context.error;
  const body = (await request.json().catch(() => ({}))) as { reason?: string };
  const reason = body.reason?.trim() || "Account review";

  const business = await prisma.business.findUnique({
    where: { id: params.id },
    include: { users: true },
  });
  if (!business) return NextResponse.json({ error: "Customer not found." }, { status: 404 });

  await prisma.$transaction([
    prisma.business.update({ where: { id: params.id }, data: { notes: reason } }),
    prisma.user.updateMany({ where: { businessId: params.id }, data: { active: false, status: "SUSPENDED" } }),
    prisma.nexaInsight.create({
      data: {
        businessId: context.business.id,
        type: "warning",
        message: `${business.name} suspended — ${reason}`,
        action: "Customer suspended",
      },
    }),
  ]);
  await transitionBusinessStatus(params.id, "SUSPENDED", reason);

  const boss = business.users.find((user) => user.role === "BOSS");
  if (boss) {
    await sendEmail({
      to: boss.email,
      toName: boss.name,
      subject: "Your BGOS workspace has been suspended",
      html: "<p>Your BGOS workspace has been suspended. Contact your account manager.</p>",
    }).catch(() => false);
  }

  return NextResponse.json({ success: true });
}
