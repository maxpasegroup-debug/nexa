import { NextResponse } from "next/server";

import {
  getSdeContext,
  isPriority,
  isTaskStatus,
  priorityOrder,
} from "@/lib/sde/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const context = await getSdeContext();

    if (context.error) return context.error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const sprintId = searchParams.get("sprintId");
    const priority = searchParams.get("priority");

    const tasks = await prisma.task.findMany({
      where: {
        assignedTo: context.user.id,
        ...(isTaskStatus(status) ? { status } : {}),
        ...(isPriority(priority) ? { priority } : {}),
        ...(sprintId ? { sprintId } : {}),
      },
      include: {
        sprint: { select: { id: true, name: true } },
      },
      orderBy: [{ dueDate: "asc" }],
    });

    return NextResponse.json({
      tasks: tasks.sort(
        (a, b) =>
          priorityOrder(b.priority) - priorityOrder(a.priority) ||
          (a.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER) -
            (b.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER),
      ),
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch SDE tasks." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const context = await getSdeContext();

    if (context.error) return context.error;

    const {
      title,
      description,
      priority,
      dueDate,
      sprintId,
      storyPoints,
      assignedTo,
    } = await request.json();

    if (typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "title is required." }, { status: 400 });
    }

    const assigneeId =
      typeof assignedTo === "string" && assignedTo ? assignedTo : context.user.id;
    const assignee = await prisma.user.findFirst({
      where: { id: assigneeId, businessId: context.businessId },
      select: { id: true },
    });

    if (!assignee) {
      return NextResponse.json({ error: "Assignee not found." }, { status: 404 });
    }

    if (sprintId) {
      const sprint = await prisma.sprint.findFirst({
        where: { id: String(sprintId), businessId: context.businessId },
        select: { id: true },
      });

      if (!sprint) {
        return NextResponse.json({ error: "Sprint not found." }, { status: 404 });
      }
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: typeof description === "string" ? description : undefined,
        priority: isPriority(priority) ? priority : "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : undefined,
        sprintId: typeof sprintId === "string" && sprintId ? sprintId : undefined,
        storyPoints: Math.max(1, Number(storyPoints ?? 1)),
        assignedTo: assigneeId,
      },
      include: { sprint: { select: { id: true, name: true } } },
    });

    await prisma.activityLog.create({
      data: {
        businessId: context.businessId,
        userId: context.user.id,
        action: "Task created",
        entity: "Task",
        entityId: task.id,
        meta: { title: task.title },
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to create task." },
      { status: 500 },
    );
  }
}
