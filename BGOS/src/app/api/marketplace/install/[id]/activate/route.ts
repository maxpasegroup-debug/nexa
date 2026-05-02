import { NextResponse } from "next/server";

import { requireRole } from "@/lib/api-auth";
import { sendEmail } from "@/lib/email";
import { escapeHtml, findBossForBusiness } from "@/lib/marketplace";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const authResult = await requireRole(["SDE", "OWNER"]);
    if (authResult.response) {
      return authResult.response;
    }

    const installation = await prisma.agentInstallation.findFirst({
      where: {
        id: params.id,
        ...(authResult.user.role === "SDE"
          ? { sdeAssignedId: authResult.user.id }
          : {}),
      },
      include: {
        agent: true,
        business: true,
      },
    });

    if (!installation) {
      return NextResponse.json({ error: "Installation not found." }, { status: 404 });
    }

    if (installation.status === "FAILED" || installation.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Failed or cancelled installations cannot be activated." },
        { status: 400 },
      );
    }

    await prisma.agentInstallation.update({
      where: { id: installation.id },
      data: { status: "SDE_BUILDING" },
    });

    const updated = await prisma.agentInstallation.update({
      where: { id: installation.id },
      data: {
        status: "ACTIVE",
        sdeCompletedAt: new Date(),
        activeFrom: new Date(),
        installedAt: installation.installedAt ?? new Date(),
      },
    });

    const boss = await findBossForBusiness(installation.businessId);

    await Promise.allSettled([
      boss
        ? sendEmail({
            to: boss.email,
            toName: boss.name,
            subject: `${installation.agent.name} is now active`,
            html: `<p>🎉 <strong>${escapeHtml(installation.agent.name)}</strong> is now active in your BGOS workspace.</p>`,
          })
        : Promise.resolve(false),
      prisma.nexaInsight.create({
        data: {
          businessId: installation.businessId,
          type: "marketplace",
          message: `${installation.agent.name} is now active. ${installation.agent.tagline}`,
          action: "Open marketplace",
        },
      }),
    ]);

    return NextResponse.json({ success: true, installation: updated });
  } catch (error) {
    console.error("[marketplace:install:activate]", error);
    return NextResponse.json(
      { error: "Unable to activate installation." },
      { status: 500 },
    );
  }
}
