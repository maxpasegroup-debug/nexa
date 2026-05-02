import { NextResponse } from "next/server";

import { getBdmContext, todayBounds } from "@/lib/bdm/server";
import { prisma } from "@/lib/prisma";

const bdmLeadStatuses = ["NEW", "CONTACTED", "FOLLOW_UP", "ONBOARDING", "LOST"] as const;
const bdmStatusRank: Record<(typeof bdmLeadStatuses)[number], number> = {
  FOLLOW_UP: 0,
  CONTACTED: 1,
  NEW: 2,
  ONBOARDING: 3,
  LOST: 4,
};

function isBdmLeadStatus(value: unknown): value is (typeof bdmLeadStatuses)[number] {
  return typeof value === "string" && bdmLeadStatuses.includes(value as (typeof bdmLeadStatuses)[number]);
}

function daysSince(value?: Date | null) {
  if (!value) return null;
  return Math.floor((Date.now() - value.getTime()) / (24 * 60 * 60 * 1000));
}

export async function GET(request: Request) {
  try {
    const context = await getBdmContext();

    if (context.error) return context.error;

    const { searchParams } = new URL(request.url);
    const bdmStatus = searchParams.get("bdmStatus") ?? searchParams.get("status");
    const search = searchParams.get("search");
    const overdue = searchParams.get("overdue") === "true";
    const today = todayBounds();

    const leads = await prisma.lead.findMany({
      where: {
        businessId: context.businessId,
        assignedTo: context.user.id,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                { email: { contains: search, mode: "insensitive" as const } },
                { phone: { contains: search, mode: "insensitive" as const } },
                { company: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {}),
        ...(isBdmLeadStatus(bdmStatus) ? { bdmStatus } : {}),
        ...(overdue ? { followUpDate: { lt: today.start } } : {}),
      },
      include: {
        callNotes: {
          orderBy: { createdAt: "desc" },
          take: 3,
          include: {
            author: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: [{ updatedAt: "desc" }],
    });

    const sortedLeads = leads.sort((a, b) => {
      const statusDelta = bdmStatusRank[a.bdmStatus] - bdmStatusRank[b.bdmStatus];
      if (statusDelta !== 0) return statusDelta;

      const aOverdue = a.followUpDate && a.followUpDate < today.start ? 1 : 0;
      const bOverdue = b.followUpDate && b.followUpDate < today.start ? 1 : 0;
      return bOverdue - aOverdue || b.updatedAt.getTime() - a.updatedAt.getTime();
    });

    return NextResponse.json({
      leads: sortedLeads.map((lead) => ({
        ...lead,
        daysSinceContact: daysSince(lead.lastContactedAt),
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch BDM leads." },
      { status: 500 },
    );
  }
}
