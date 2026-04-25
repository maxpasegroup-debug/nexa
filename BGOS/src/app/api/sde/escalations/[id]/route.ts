import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  getSdeContext,
  isEscalationStatus,
  isEscalationType,
  isPriority,
} from "@/lib/sde/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const context = await getSdeContext();

    if (context.error) return context.error;

    const existingEscalation = await prisma.escalation.findFirst({
      where: { id: params.id, businessId: context.businessId },
    });

    if (!existingEscalation) {
      return NextResponse.json(
        { error: "Escalation not found." },
        { status: 404 },
      );
    }

    const body = await request.json();

    if (
      existingEscalation.status !== "RESOLVED" &&
      body.status === "RESOLVED" &&
      typeof body.resolution !== "string"
    ) {
      return NextResponse.json(
        { error: "resolution is required when resolving an escalation." },
        { status: 400 },
      );
    }

    const escalation = await prisma.escalation.update({
      where: { id: params.id },
      data: {
        ...(isEscalationType(body.type) ? { type: body.type } : {}),
        ...(typeof body.title === "string" ? { title: body.title } : {}),
        ...(typeof body.description === "string"
          ? { description: body.description }
          : {}),
        ...(isPriority(body.priority) ? { priority: body.priority } : {}),
        ...(isEscalationStatus(body.status) ? { status: body.status } : {}),
        ...(typeof body.resolution === "string"
          ? { resolution: body.resolution }
          : {}),
        ...(existingEscalation.status !== "RESOLVED" &&
        body.status === "RESOLVED"
          ? { resolvedAt: new Date(), resolvedBy: context.user.id }
          : {}),
      },
      include: {
        raiser: { select: { id: true, name: true, role: true } },
        resolver: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json({ escalation });
  } catch {
    return NextResponse.json(
      { error: "Unable to update escalation." },
      { status: 500 },
    );
  }
}
