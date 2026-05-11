import { NextResponse } from "next/server";

import { badRequest, BLIZZWAY_ADMIN_MODEL, readAssessmentData, requireBlizzwayAdmin } from "@/lib/blizzway-admin";
import { getString } from "@/lib/marketplace";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireBlizzwayAdmin();
  if ("error" in auth) return auth.error;
  const assessments = await prisma.blizzwayAssessmentDefinition.findMany({
    where: { businessModel: BLIZZWAY_ADMIN_MODEL },
    orderBy: [{ active: "desc" }, { category: "asc" }, { title: "asc" }],
  });
  return NextResponse.json({ assessments, total: assessments.length });
}

export async function POST(request: Request) {
  const auth = await requireBlizzwayAdmin();
  if ("error" in auth) return auth.error;
  const body = (await request.json()) as Record<string, unknown>;
  const parsed = readAssessmentData(body);
  if ("error" in parsed) return badRequest(String(parsed.error));
  const assessment = await prisma.blizzwayAssessmentDefinition.create({ data: parsed.data });
  return NextResponse.json({ assessment }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await requireBlizzwayAdmin();
  if ("error" in auth) return auth.error;
  const body = (await request.json()) as Record<string, unknown>;
  const id = getString(body.id);
  if (!id) return badRequest("id is required.");
  const parsed = readAssessmentData(body);
  if ("error" in parsed) return badRequest(String(parsed.error));
  const assessment = await prisma.blizzwayAssessmentDefinition.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ assessment });
}
