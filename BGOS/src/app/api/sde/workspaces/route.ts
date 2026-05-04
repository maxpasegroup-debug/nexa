import { NextResponse } from "next/server";
import type { OnboardingLeadStatus } from "@prisma/client";

import { sdeOnly } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const activeStatuses: OnboardingLeadStatus[] = [
  "BDM_SUBMITTED",
  "SDE_BUILDING",
  "SDE_DELIVERED",
];

export async function GET() {
  return sdeOnly(async (session) => {
  try {
    const leads = await prisma.onboardingLead.findMany({
      where:
        session.user.role === "SDE"
          ? {
              assignedSDEId: session.user.id,
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
  });
}
