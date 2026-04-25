import { NextResponse } from "next/server";

import { getCurrentBusiness } from "@/lib/dashboard/server";
import { prisma } from "@/lib/prisma";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export async function GET() {
  try {
    const context = await getCurrentBusiness();
    if (context.error) return context.error;

    const snapshots = await prisma.businessSnapshot.findMany({
      where: { businessId: context.business.id },
      orderBy: { date: "desc" },
      take: 30,
      select: {
        date: true,
        healthScore: true,
        totalLeads: true,
        wonLeads: true,
        newLeads: true,
      },
    });

    return NextResponse.json({
      data: snapshots.reverse().map((snapshot) => ({
        date: formatDate(snapshot.date),
        healthScore: snapshot.healthScore,
        totalLeads: snapshot.totalLeads,
        wonLeads: snapshot.wonLeads,
        newLeads: snapshot.newLeads,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch health trend." },
      { status: 500 },
    );
  }
}
