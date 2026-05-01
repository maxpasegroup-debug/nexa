import { NextResponse } from "next/server";

import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const session = await auth();
    const businessId = session?.user?.businessId ?? undefined;
    const now = new Date();

    const agent = await prisma.marketplaceAgent.findUnique({
      where: { slug: params.slug },
      include: {
        installations: businessId
          ? {
              where: { businessId },
              select: { id: true, status: true },
            }
          : false,
        offers: {
          where: {
            isActive: true,
            OR: [{ validUntil: null }, { validUntil: { gt: now } }],
          },
          orderBy: { validFrom: "desc" },
        },
      },
    });

    if (!agent || !agent.isActive) {
      return NextResponse.json({ error: "Agent not found." }, { status: 404 });
    }

    const installation = "installations" in agent ? agent.installations[0] : null;
    const { installations, ...rest } = agent;
    void installations;

    return NextResponse.json({
      agent: {
        ...rest,
        installed: Boolean(installation),
        installStatus: installation?.status ?? null,
        installationId: installation?.id ?? null,
      },
      offers: rest.offers,
    });
  } catch (error) {
    console.error("[marketplace:agent]", error);
    return NextResponse.json(
      { error: "Unable to fetch marketplace agent." },
      { status: 500 },
    );
  }
}
