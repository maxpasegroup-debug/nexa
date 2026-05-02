import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import {
  getBool,
  getAgentType,
  getNumber,
  getString,
  isAgentCategory,
} from "@/lib/marketplace";
import { requireInternalOwnerApi } from "@/lib/internal-owner";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function updateData(
  body: Record<string, unknown>,
): { data: Prisma.MarketplaceAgentUpdateInput } | { error: string } {
  const data: Prisma.MarketplaceAgentUpdateInput = {};
  const mutable = data as Record<string, unknown>;
  const requiredStringFields = [
    "slug",
    "name",
    "tagline",
    "description",
    "icon",
    "colorPrimary",
    "colorSecondary",
    "gradient",
  ];

  for (const field of requiredStringFields) {
    if (field in body) {
      const value = getString(body[field]);
      if (!value) return { error: `${field} cannot be empty.` };
      mutable[field] = value;
    }
  }

  for (const field of ["metaTitle", "metaDesc"]) {
    if (field in body) mutable[field] = getString(body[field]) || null;
  }

  if ("category" in body) {
    const category = getString(body.category);
    if (!isAgentCategory(category)) return { error: "Invalid category." };
    data.category = category;
  }

  if ("type" in body || "agentType" in body) {
    const type = getAgentType(body.type ?? body.agentType);
    if (!type) return { error: "Invalid agent type." };
    data.type = type;
  }

  for (const field of ["onboardingFee", "monthlyFee", "sortOrder"]) {
    if (field in body) {
      const value = getNumber(body[field]);
      if (value === undefined) return { error: `Invalid ${field}.` };
      mutable[field] = value;
    }
  }

  for (const field of ["isActive", "isFeatured"]) {
    if (field in body) {
      const value = getBool(body[field]);
      if (value === undefined) return { error: `Invalid ${field}.` };
      mutable[field] = value;
    }
  }

  for (const field of ["features", "benefits", "howItWorks", "stats"]) {
    if (field in body) mutable[field] = body[field];
  }

  return { data };
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const authResult = await requireInternalOwnerApi();
    if ("error" in authResult) return authResult.error;

    const body = (await request.json()) as Record<string, unknown>;
    const parsed = updateData(body);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const agent = await prisma.marketplaceAgent.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json({ agent });
  } catch (error) {
    console.error("[internal:marketplace:update]", error);
    return NextResponse.json(
      { error: "Unable to update marketplace agent." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const authResult = await requireInternalOwnerApi();
    if ("error" in authResult) return authResult.error;

    const activeInstallations = await prisma.agentInstallation.count({
      where: {
        agentId: params.id,
        status: { not: "CANCELLED" },
      },
    });

    if (activeInstallations > 0) {
      return NextResponse.json(
        { error: "Cannot delete an agent with active installations." },
        { status: 400 },
      );
    }

    await prisma.marketplaceAgent.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[internal:marketplace:delete]", error);
    return NextResponse.json(
      { error: "Unable to delete marketplace agent." },
      { status: 500 },
    );
  }
}
