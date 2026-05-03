import { NextResponse } from "next/server";

import { requireRole } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authResult = await requireRole("BOSS");
    if (authResult.response) {
      return authResult.response;
    }

    const businessId = authResult.user.businessId;
    if (!businessId) {
      return NextResponse.json({ agents: [] });
    }

    const installations = await prisma.agentInstallation.findMany({
      where: {
        businessId,
        status: { in: ["AWAITING_PAYMENT", "PENDING", "PAYMENT_DONE", "SDE_BUILDING", "ACTIVE"] },
        agent: {
          isActive: true,
        },
      },
      select: {
        id: true,
        status: true,
        agent: {
          select: {
            id: true,
            slug: true,
            name: true,
            icon: true,
            type: true,
          },
        },
      },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    });

    return NextResponse.json({
      agents: installations.map((installation) => ({
        id: installation.agent.id,
        installationId: installation.id,
        name: installation.agent.name,
        slug: installation.agent.slug,
        icon: installation.agent.icon,
        type: installation.agent.type,
        status: installation.status,
        href: `/boss/agents/${encodeURIComponent(installation.agent.slug)}`,
      })),
    });
  } catch (error) {
    console.error("[marketplace:installed-ui-agents]", error);
    return NextResponse.json(
      { error: "Unable to fetch installed UI agents." },
      { status: 500 },
    );
  }
}
