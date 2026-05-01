import { NextResponse } from "next/server";

import auth from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { escapeHtml, findBossForBusiness } from "@/lib/marketplace";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "SDE") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const installation = await prisma.agentInstallation.findFirst({
      where: { id: params.id, sdeAssignedId: session.user.id },
      include: {
        agent: true,
        business: true,
      },
    });

    if (!installation) {
      return NextResponse.json({ error: "Installation not found." }, { status: 404 });
    }

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
