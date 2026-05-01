import { NextResponse } from "next/server";

import auth from "@/lib/auth";
import { isAgentCategory } from "@/lib/marketplace";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const businessId = session?.user?.businessId ?? undefined;
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const agents = await prisma.marketplaceAgent.findMany({
      where: {
        isActive: true,
        ...(isAgentCategory(category) ? { category } : {}),
      },
      include: {
        installations: businessId
          ? {
              where: { businessId },
              select: { status: true },
            }
          : false,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    const withInstallation = agents.map((agent) => {
      const installation = "installations" in agent ? agent.installations[0] : null;
      const { installations, ...rest } = agent;
      void installations;

      return {
        ...rest,
        installed: Boolean(installation),
        installStatus: installation?.status ?? null,
      };
    });

    return NextResponse.json({
      agents: withInstallation,
      featured: withInstallation.find((agent) => agent.isFeatured) ?? null,
    });
  } catch (error) {
    console.error("[marketplace:agents]", error);
    return NextResponse.json(
      { error: "Unable to fetch marketplace agents." },
      { status: 500 },
    );
  }
}
