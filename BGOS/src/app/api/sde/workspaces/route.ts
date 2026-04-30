import { NextResponse } from "next/server";

import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const activeStatuses = ["BDM_SUBMITTED", "SDE_BUILDING"] as const;

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "SDE") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const leads = await prisma.onboardingLead.findMany({
      where: { assignedSDEId: session.user.id },
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
