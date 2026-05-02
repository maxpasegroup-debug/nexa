import { NextResponse } from "next/server";

import { requireInternalOwnerApi } from "@/lib/internal-owner";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function agentNameFromNotes(notes?: string | null) {
  if (!notes) return "Unknown agent";
  const match =
    notes.match(/Interested in ([^.]+?) from marketplace/i) ??
    notes.match(/interested in ([^.]+?)(?:\.|$)/i) ??
    notes.match(/wants to add ([^.]+?)(?:\.|$)/i);
  return match?.[1]?.trim() ?? "Unknown agent";
}

export async function GET() {
  try {
    const authResult = await requireInternalOwnerApi();
    if ("error" in authResult) return authResult.error;

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const leads = await prisma.onboardingLead.findMany({
      where: { source: "marketplace" },
      orderBy: { createdAt: "desc" },
      include: {
        assignedBDM: { select: { id: true, name: true, email: true } },
      },
    });

    const byAgentMap = new Map<string, { agentName: string; count: number; converted: number }>();
    leads.forEach((lead) => {
      const agentName = agentNameFromNotes(lead.bdmNotes);
      const current = byAgentMap.get(agentName) ?? { agentName, count: 0, converted: 0 };
      current.count += 1;
      if (lead.status === "CONVERTED" || lead.convertedAt) current.converted += 1;
      byAgentMap.set(agentName, current);
    });

    return NextResponse.json({
      leads: leads.map((lead) => ({
        ...lead,
        agentName: agentNameFromNotes(lead.bdmNotes),
        createdAt: lead.createdAt.toISOString(),
        updatedAt: lead.updatedAt.toISOString(),
      })),
      byAgent: Array.from(byAgentMap.values()).sort((a, b) => b.count - a.count),
      totalToday: leads.filter((lead) => lead.createdAt >= startOfToday).length,
      totalThisMonth: leads.filter((lead) => lead.createdAt >= startOfMonth).length,
    });
  } catch (error) {
    console.error("[internal:marketplace:leads]", error);
    return NextResponse.json(
      { error: "Unable to load marketplace leads." },
      { status: 500 },
    );
  }
}
