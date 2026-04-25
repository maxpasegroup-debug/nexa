import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSdeContext, isSprintStatus } from "@/lib/sde/server";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const context = await getSdeContext();

    if (context.error) return context.error;

    const sprint = await prisma.sprint.findFirst({
      where: { id: params.id, businessId: context.businessId },
      include: {
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, role: true } },
          },
          orderBy: { dueDate: "asc" },
        },
      },
    });

    if (!sprint) {
      return NextResponse.json({ error: "Sprint not found." }, { status: 404 });
    }

    return NextResponse.json({ sprint });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch sprint." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const context = await getSdeContext();

    if (context.error) return context.error;

    const existingSprint = await prisma.sprint.findFirst({
      where: { id: params.id, businessId: context.businessId },
      include: { tasks: { select: { status: true, storyPoints: true } } },
    });

    if (!existingSprint) {
      return NextResponse.json({ error: "Sprint not found." }, { status: 404 });
    }

    const body = await request.json();

    if (body.status === "ACTIVE" && existingSprint.status !== "ACTIVE") {
      const activeSprint = await prisma.sprint.findFirst({
        where: {
          businessId: context.businessId,
          status: "ACTIVE",
          id: { not: params.id },
        },
      });

      if (activeSprint) {
        return NextResponse.json(
          { error: "Another sprint is already active." },
          { status: 400 },
        );
      }
    }

    const sprint = await prisma.sprint.update({
      where: { id: params.id },
      data: {
        ...(typeof body.name === "string" ? { name: body.name } : {}),
        ...(typeof body.goal === "string" ? { goal: body.goal } : {}),
        ...(body.startDate ? { startDate: new Date(body.startDate) } : {}),
        ...(body.endDate ? { endDate: new Date(body.endDate) } : {}),
        ...(isSprintStatus(body.status) ? { status: body.status } : {}),
      },
      include: { tasks: { select: { status: true, storyPoints: true } } },
    });

    const velocity =
      body.status === "COMPLETED" && existingSprint.status !== "COMPLETED"
        ? sprint.tasks
            .filter((task) => task.status === "DONE")
            .reduce((sum, task) => sum + task.storyPoints, 0)
        : undefined;

    return NextResponse.json({ sprint, ...(velocity !== undefined ? { velocity } : {}) });
  } catch {
    return NextResponse.json(
      { error: "Unable to update sprint." },
      { status: 500 },
    );
  }
}
