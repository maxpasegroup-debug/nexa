import { NextResponse } from "next/server";

import { badRequest, BLIZZWAY_ADMIN_MODEL, readCompanionData, requireBlizzwayAdmin } from "@/lib/blizzway-admin";
import { getString } from "@/lib/marketplace";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statuses = new Set(["PENDING", "REVIEWING", "APPROVED", "REJECTED", "FULFILLED"]);

export async function GET() {
  const auth = await requireBlizzwayAdmin();
  if ("error" in auth) return auth.error;
  const requests = await prisma.blizzwayCompanionRequest.findMany({
    where: { businessModel: BLIZZWAY_ADMIN_MODEL },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, email: true } }, business: { select: { id: true, name: true } } },
  });
  return NextResponse.json({ requests, total: requests.length });
}

export async function PATCH(request: Request) {
  const auth = await requireBlizzwayAdmin();
  if ("error" in auth) return auth.error;
  const body = (await request.json()) as Record<string, unknown>;
  const id = getString(body.id);
  if (!id) return badRequest("id is required.");
  const status = getString(body.status).toUpperCase();
  if (!statuses.has(status)) return badRequest("Invalid request status.");

  const requestRecord = await prisma.blizzwayCompanionRequest.update({
    where: { id },
    data: {
      status,
      metadata: {
        adminNotes: getString(body.adminNotes),
        updatedBy: auth.owner.id,
        updatedAt: new Date().toISOString(),
      },
    },
  });

  let companion = null;
  if (getString(body.action) === "convert") {
    const parsed = readCompanionData({
      name: requestRecord.title,
      slug: getString(body.slug),
      description: requestRecord.description,
      companionCategory: requestRecord.category,
      expectedOutput: requestRecord.expectedOutput ?? "",
      career7Status: "DRAFT",
      isActive: false,
      isRequestable: true,
    });
    if ("error" in parsed) return badRequest(String(parsed.error));
    companion = await prisma.marketplaceAgent.create({ data: parsed.data });
  }

  return NextResponse.json({ request: requestRecord, companion });
}
