import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSdeContext, isBugStatus, isSeverity } from "@/lib/sde/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const context = await getSdeContext();

    if (context.error) return context.error;

    const existingBug = await prisma.bug.findFirst({
      where: { id: params.id, businessId: context.businessId },
    });

    if (!existingBug) {
      return NextResponse.json({ error: "Bug not found." }, { status: 404 });
    }

    const body = await request.json();

    if (
      existingBug.status !== "RESOLVED" &&
      body.status === "RESOLVED" &&
      typeof body.resolution !== "string"
    ) {
      return NextResponse.json(
        { error: "resolution is required when resolving a bug." },
        { status: 400 },
      );
    }

    const bug = await prisma.bug.update({
      where: { id: params.id },
      data: {
        ...(typeof body.title === "string" ? { title: body.title } : {}),
        ...(typeof body.description === "string"
          ? { description: body.description }
          : {}),
        ...(isSeverity(body.severity) ? { severity: body.severity } : {}),
        ...(isBugStatus(body.status) ? { status: body.status } : {}),
        ...(typeof body.assignedTo === "string" || body.assignedTo === null
          ? { assignedTo: body.assignedTo || null }
          : {}),
        ...(typeof body.stepsToRepro === "string"
          ? { stepsToRepro: body.stepsToRepro }
          : {}),
        ...(typeof body.resolution === "string"
          ? { resolution: body.resolution }
          : {}),
        ...(existingBug.status !== "RESOLVED" && body.status === "RESOLVED"
          ? { resolvedAt: new Date() }
          : {}),
      },
      include: {
        reporter: { select: { id: true, name: true, role: true } },
        assignee: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json({ bug });
  } catch {
    return NextResponse.json(
      { error: "Unable to update bug." },
      { status: 500 },
    );
  }
}
