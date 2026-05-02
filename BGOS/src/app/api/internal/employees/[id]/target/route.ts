import { NextResponse } from "next/server";

import { requireInternalOwnerApi } from "@/lib/internal-owner";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const context = await requireInternalOwnerApi();
  if ("error" in context) return context.error;

  const body = (await request.json()) as { revenueTarget?: unknown };
  const revenueTarget = Number(body.revenueTarget);
  if (!Number.isFinite(revenueTarget)) {
    return NextResponse.json({ error: "revenueTarget is required." }, { status: 400 });
  }

  const now = new Date();
  const target = await prisma.target.upsert({
    where: {
      userId_month_year: {
        userId: params.id,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    },
    create: {
      userId: params.id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      revenueTarget,
    },
    update: { revenueTarget },
  });

  return NextResponse.json({ target });
}
