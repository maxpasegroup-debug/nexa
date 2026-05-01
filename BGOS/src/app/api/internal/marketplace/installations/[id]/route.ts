import { NextResponse } from "next/server";

import { getString, requireSession } from "@/lib/marketplace";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const authResult = await requireSession(["OWNER"]);
    if ("error" in authResult) return authResult.error;

    const body = (await request.json()) as Record<string, unknown>;
    const action = getString(body.action);
    const sdeAssignedId = getString(body.sdeAssignedId);

    if (action === "assign_sde") {
      if (!sdeAssignedId) {
        return NextResponse.json({ error: "sdeAssignedId is required." }, { status: 400 });
      }

      const sde = await prisma.user.findFirst({
        where: { id: sdeAssignedId, role: "SDE", active: true },
        select: { id: true },
      });

      if (!sde) return NextResponse.json({ error: "SDE not found." }, { status: 404 });

      const installation = await prisma.agentInstallation.update({
        where: { id: params.id },
        data: { sdeAssignedId },
        include: { agent: true, business: true, sdeAssignee: { select: { id: true, name: true, email: true } } },
      });

      return NextResponse.json({ installation });
    }

    if (action === "mark_building") {
      const installation = await prisma.agentInstallation.update({
        where: { id: params.id },
        data: { status: "SDE_BUILDING" },
        include: { agent: true, business: true, sdeAssignee: { select: { id: true, name: true, email: true } } },
      });
      return NextResponse.json({ installation });
    }

    if (action === "mark_active") {
      const now = new Date();
      const installation = await prisma.agentInstallation.update({
        where: { id: params.id },
        data: {
          status: "ACTIVE",
          activeFrom: now,
          installedAt: now,
          sdeCompletedAt: now,
        },
        include: { agent: true, business: true, sdeAssignee: { select: { id: true, name: true, email: true } } },
      });
      return NextResponse.json({ installation });
    }

    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  } catch (error) {
    console.error("[internal:marketplace:installation:update]", error);
    return NextResponse.json(
      { error: "Unable to update installation." },
      { status: 500 },
    );
  }
}
