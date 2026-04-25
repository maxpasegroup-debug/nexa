import { NextResponse } from "next/server";

import { getBdmContext, todayBounds } from "@/lib/bdm/server";
import { isLeadStatus } from "@/lib/leads/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const context = await getBdmContext();

    if (context.error) return context.error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const overdue = searchParams.get("overdue") === "true";
    const today = todayBounds();

    const leads = await prisma.lead.findMany({
      where: {
        assignedTo: context.user.id,
        ...(isLeadStatus(status) ? { status } : {}),
        ...(overdue ? { followUpDate: { lt: today.start } } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
                { company: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        _count: { select: { activities: true } },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
      orderBy: [{ score: "desc" }],
    });

    const sortedLeads = leads.sort((a, b) => {
      const aOverdue = a.followUpDate && a.followUpDate < today.start ? 1 : 0;
      const bOverdue = b.followUpDate && b.followUpDate < today.start ? 1 : 0;
      return bOverdue - aOverdue || b.score - a.score;
    });

    return NextResponse.json({
      leads: sortedLeads.map((lead) => ({
        ...lead,
        activitiesCount: lead._count.activities,
        lastActivityDate: lead.activities[0]?.createdAt ?? null,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch BDM leads." },
      { status: 500 },
    );
  }
}
