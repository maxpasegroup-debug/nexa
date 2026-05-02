import { NextResponse } from "next/server";
import type { OnboardingLeadStatus } from "@prisma/client";

import { requireRole } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const activeStatuses: OnboardingLeadStatus[] = [
  "BDM_SUBMITTED",
  "SDE_BUILDING",
  "SDE_DELIVERED",
];

export async function GET() {
  try {
    const authResult = await requireRole(["SDE", "OWNER"]);
    if (authResult.response) {
      return authResult.response;
    }

    const leads = await prisma.onboardingLead.findMany({
      where:
        authResult.user.role === "SDE"
          ? {
              assignedSDEId: authResult.user.id,
              status: { in: activeStatuses },
            }
          : { status: { in: activeStatuses } },
      orderBy: { updatedAt: "desc" },
      include: {
        assignedBDM: { select: { id: true, name: true, email: true } },
        workspaceConfig: true,
      },
    });

    const pendingCount = leads.filter((lead) =>
      activeStatuses.includes(lead.status as (typeof activeStatuses)[number]),
    ).length;

    return NextResponse.json({ leads, pendingCount });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch workspace builds." },
      { status: 500 },
    );
  }
}
