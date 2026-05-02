import { NextResponse } from "next/server";

import { csvEscape, getCustomerRows } from "@/lib/internal-control";
import { requireInternalOwnerApi } from "@/lib/internal-owner";

export async function GET(request: Request) {
  const context = await requireInternalOwnerApi();
  if ("error" in context) return context.error;

  const rows = await getCustomerRows(context.business.id, new URL(request.url).searchParams);
  const headers = [
    "clientId",
    "name",
    "plan",
    "status",
    "mrr",
    "healthScore",
    "bdmName",
    "joinedAt",
    "lastLoginAt",
    "avgRating",
    "openTickets",
  ];
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      [
        row.clientId,
        row.name,
        row.plan,
        row.status,
        row.mrr,
        row.healthScore,
        row.bdmName,
        row.joinedAt,
        row.lastLoginAt,
        row.avgRating ?? "",
        row.openTickets,
      ]
        .map(csvEscape)
        .join(","),
    ),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bgos-customers.csv"`,
    },
  });
}
