import { NextResponse } from "next/server";

import { requireRole } from "@/lib/api-auth";
import { getString } from "@/lib/marketplace";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const authResult = await requireRole(["BOSS", "OWNER"]);
    if (authResult.response) {
      return authResult.response;
    }

    const body = (await request.json()) as Record<string, unknown>;
    const agentId = getString(body.agentId);
    const email = getString(body.email).toLowerCase();
    const requestedBusinessId = getString(body.businessId);
    const businessId = requestedBusinessId || authResult.user.businessId || undefined;

    if (!agentId || !email) {
      return NextResponse.json(
        { error: "agentId and email are required." },
        { status: 400 },
      );
    }

    if (
      requestedBusinessId &&
      authResult.user.role !== "OWNER" &&
      requestedBusinessId !== authResult.user.businessId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const requestRecord = await prisma.agentNotifyRequest.upsert({
      where: { agentId_email: { agentId, email } },
      create: { agentId, email, businessId },
      update: { businessId },
    });

    return NextResponse.json({ success: true, request: requestRecord }, { status: 201 });
  } catch (error) {
    console.error("[marketplace:notify]", error);
    return NextResponse.json(
      { error: "Unable to save notify request." },
      { status: 500 },
    );
  }
}
