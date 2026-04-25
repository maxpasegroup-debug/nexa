import { NextResponse } from "next/server";

import { getCurrentBusiness } from "@/lib/dashboard/server";
import { prisma } from "@/lib/prisma";

const statuses = ["NEW", "CONTACTED", "DEMO", "PROPOSAL", "WON"] as const;

function rate(from: number, to: number) {
  return from > 0 ? Math.round((to / from) * 1000) / 10 : 0;
}

export async function GET() {
  try {
    const context = await getCurrentBusiness();
    if (context.error) return context.error;

    const counts = await Promise.all(
      statuses.map((status) =>
        prisma.lead.count({
          where: { businessId: context.business.id, status },
        }),
      ),
    );
    const total = counts.reduce((sum, count) => sum + count, 0);

    return NextResponse.json({
      data: statuses.map((status, index) => ({
        status,
        label: status.charAt(0) + status.slice(1).toLowerCase(),
        count: counts[index],
        conversionRate:
          index < statuses.length - 1
            ? rate(counts[index], counts[index + 1])
            : null,
      })),
      conversions: {
        newToContacted: rate(counts[0], counts[1]),
        contactedToDemo: rate(counts[1], counts[2]),
        demoToProposal: rate(counts[2], counts[3]),
        proposalToWon: rate(counts[3], counts[4]),
        overall: total > 0 ? rate(total, counts[4]) : 0,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch lead funnel." },
      { status: 500 },
    );
  }
}
