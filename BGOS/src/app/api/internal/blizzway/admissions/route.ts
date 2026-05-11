import { NextResponse } from "next/server";

import { badRequest, BLIZZWAY_ADMIN_MODEL, readAdmissionData, requireBlizzwayAdmin } from "@/lib/blizzway-admin";
import { getString } from "@/lib/marketplace";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireBlizzwayAdmin();
  if ("error" in auth) return auth.error;
  const pathways = await prisma.blizzwayAdmissionPathwayDefinition.findMany({
    where: { businessModel: BLIZZWAY_ADMIN_MODEL },
    orderBy: [{ active: "desc" }, { countryRegion: "asc" }, { title: "asc" }],
  });
  return NextResponse.json({ pathways, total: pathways.length });
}

export async function POST(request: Request) {
  const auth = await requireBlizzwayAdmin();
  if ("error" in auth) return auth.error;
  const body = (await request.json()) as Record<string, unknown>;
  const parsed = readAdmissionData(body);
  if ("error" in parsed) return badRequest(String(parsed.error));
  const pathway = await prisma.blizzwayAdmissionPathwayDefinition.create({ data: parsed.data });
  return NextResponse.json({ pathway }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await requireBlizzwayAdmin();
  if ("error" in auth) return auth.error;
  const body = (await request.json()) as Record<string, unknown>;
  const id = getString(body.id);
  if (!id) return badRequest("id is required.");
  if (getString(body.action) === "archive") {
    const pathway = await prisma.blizzwayAdmissionPathwayDefinition.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ pathway });
  }
  const parsed = readAdmissionData(body);
  if ("error" in parsed) return badRequest(String(parsed.error));
  const pathway = await prisma.blizzwayAdmissionPathwayDefinition.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ pathway });
}
