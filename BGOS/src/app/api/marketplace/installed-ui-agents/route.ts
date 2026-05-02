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
        status: "ACTIVE",
        agent: {
          isActive: true,
          type: "UI",
        },
      },
      select: {
        id: true,
        agent: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
      orderBy: {
        activeFrom: "desc",
      },
    });

    return NextResponse.json({
      agents: installations.map((installation) => ({
        id: installation.agent.id,
        installationId: installation.id,
        name: installation.agent.name,
        slug: installation.agent.slug,
        href: `/boss/marketplace?agent=${encodeURIComponent(installation.agent.slug)}`,
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
