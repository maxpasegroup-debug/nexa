import { NextResponse } from "next/server";

import { badRequest, BLIZZWAY_ADMIN_MODEL, readCompanionData, requireBlizzwayAdmin } from "@/lib/blizzway-admin";
import { getString } from "@/lib/marketplace";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireBlizzwayAdmin();
  if ("error" in auth) return auth.error;

  const companions = await prisma.marketplaceAgent.findMany({
    where: { businessModel: BLIZZWAY_ADMIN_MODEL, career7Type: { not: null } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          blizzwayCompanionActivations: true,
          blizzwayCompanionRuns: true,
        },
      },
    },
  });
  return NextResponse.json({ companions, total: companions.length });
}

export async function POST(request: Request) {
  try {
    const auth = await requireBlizzwayAdmin();
    if ("error" in auth) return auth.error;
    const body = (await request.json()) as Record<string, unknown>;
    const parsed = readCompanionData(body);
    if ("error" in parsed) return badRequest(String(parsed.error));

    const companion = await prisma.marketplaceAgent.create({ data: parsed.data });
    return NextResponse.json({ companion }, { status: 201 });
  } catch (error) {
    console.error("[internal:blizzway:companions:create]", error);
    return NextResponse.json({ error: "Unable to create companion." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireBlizzwayAdmin();
    if ("error" in auth) return auth.error;
    const body = (await request.json()) as Record<string, unknown>;
    const id = getString(body.id);
    if (!id) return badRequest("id is required.");

    const action = getString(body.action);
    if (action === "archive") {
      const companion = await prisma.marketplaceAgent.update({
        where: { id },
        data: { career7Status: "ARCHIVED", isActive: false },
      });
      return NextResponse.json({ companion });
    }

    const parsed = readCompanionData(body);
    if ("error" in parsed) return badRequest(String(parsed.error));
    const companion = await prisma.marketplaceAgent.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ companion });
  } catch (error) {
    console.error("[internal:blizzway:companions:update]", error);
    return NextResponse.json({ error: "Unable to update companion." }, { status: 500 });
  }
}
