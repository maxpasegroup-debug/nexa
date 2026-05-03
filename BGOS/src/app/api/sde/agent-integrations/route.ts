import { NextResponse } from "next/server";

import { requireSessionUser } from "@/lib/onboarding-session-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { error, user } = await requireSessionUser(["SDE"]);
    if (error) return error;

    const jobs = await prisma.agentInstallation.findMany({
      where: { sdeAssignedId: user.id, status: "SDE_BUILDING" },
      include: {
        agent: true,
        business: { select: { id: true, clientId: true, name: true, plan: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("[sde:agent-integrations]", error);
    return NextResponse.json({ error: "Unable to fetch agent integrations." }, { status: 500 });
  }
}
