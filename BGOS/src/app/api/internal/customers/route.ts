import { NextResponse } from "next/server";

import { customerSummary, getCustomerRows } from "@/lib/internal-control";
import { requireInternalOwnerApi } from "@/lib/internal-owner";
import { ownerOnly } from "@/lib/api-auth";

export async function GET(request: Request) {
  return ownerOnly(async () => {
  const context = await requireInternalOwnerApi();
  if ("error" in context) {
    return context.error ?? NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await getCustomerRows(context.business.id, new URL(request.url).searchParams);
  return NextResponse.json({
    customers: rows.map((row) => ({
      ...row,
      trialEndsAt: row.trialEndsAt?.toISOString() ?? null,
      lastLoginAt: row.lastLoginAt?.toISOString() ?? null,
      joinedAt: row.joinedAt.toISOString(),
    })),
    summary: customerSummary(rows),
  });
  });
}
