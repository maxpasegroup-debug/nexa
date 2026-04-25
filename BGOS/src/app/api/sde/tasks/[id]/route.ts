import { NextResponse } from "next/server";

import { notifyDev } from "@/lib/notify-dev";
import { prisma } from "@/lib/prisma";
import { getSdeContext, isPriority, isTaskStatus } from "@/lib/sde/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const context = await getSdeContext();

    if (context.error) return context.error;

    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.id,
        assignee: { businessId: context.businessId },
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    const body = await request.json();
    const data = {
      ...(typeof body.title === "string" ? { title: body.title } : {}),
      ...(typeof body.description === "string"
        ? { description: body.description }
        : {}),
      ...(isTaskStatus(body.status) ? { status: body.status } : {}),
      ...(isPriority(body.priority) ? { priority: body.priority } : {}),
      ...(body.dueDate !== undefined
        ? { dueDate: body.dueDate ? new Date(body.dueDate) : null }
        : {}),
      ...(typeof body.sprintId === "string" || body.sprintId === null
        ? { sprintId: body.sprintId || null }
        : {}),
      ...(body.storyPoints !== undefined
        ? { storyPoints: Math.max(1, Number(body.storyPoints)) }
        : {}),
      ...(typeof body.blockedBy === "string" || body.blockedBy === null
        ? { blockedBy: body.blockedBy || null }
        : {}),
    };

    const task = await prisma.task.update({
      where: { id: params.id },
      data,
      include: { sprint: { select: { id: true, name: true } } },
    });

    if (existingTask.status !== "DONE" && task.status === "DONE") {
      await prisma.activityLog.create({
        data: {
          businessId: context.businessId,
          userId: context.user.id,
          action: "Task completed",
          entity: "Task",
          entityId: task.id,
          meta: { title: task.title },
        },
      });
    }

    if (!existingTask.blockedBy && task.blockedBy) {
      const escalation = await prisma.escalation.create({
        data: {
          businessId: context.businessId,
          type: "OTHER",
          title: `Task blocked: ${task.title}`,
          description: task.blockedBy,
          priority: task.priority,
          raisedBy: context.user.id,
        },
      });

      await notifyDev(
          `Task blocked: ${task.title}`,
          `${task.title} is blocked.\n\n${task.blockedBy}`,
          task.priority === "URGENT" ? "urgent" : "high",
        );
        await prisma.escalation.update({
          where: { id: escalation.id },
          data: { notifiedDev: true },
        });
    }

    return NextResponse.json({ task });
  } catch {
    return NextResponse.json(
      { error: "Unable to update task." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const context = await getSdeContext();

    if (context.error) return context.error;

    const task = await prisma.task.findFirst({
      where: {
        id: params.id,
        assignee: { businessId: context.businessId },
      },
      select: { id: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    await prisma.task.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to delete task." },
      { status: 500 },
    );
  }
}
