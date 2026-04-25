import { NextResponse } from "next/server";

import { getSdeContext, monthBounds, weekBounds } from "@/lib/sde/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const context = await getSdeContext();

    if (context.error) return context.error;

    const week = weekBounds();
    const month = monthBounds();
    const activeSprint = await prisma.sprint.findFirst({
      where: { businessId: context.businessId, status: "ACTIVE" },
      include: { tasks: { select: { status: true } } },
      orderBy: { startDate: "desc" },
    });

    const [
      openTasks,
      inProgressTasks,
      completedThisWeek,
      openBugs,
      criticalBugs,
      openEscalations,
    ] = await Promise.all([
      prisma.task.count({
        where: { assignedTo: context.user.id, status: { not: "DONE" } },
      }),
      prisma.task.count({
        where: { assignedTo: context.user.id, status: "IN_PROGRESS" },
      }),
      prisma.task.count({
        where: {
          assignedTo: context.user.id,
          status: "DONE",
          updatedAt: { gte: week.start, lt: week.end },
        },
      }),
      prisma.bug.count({
        where: {
          businessId: context.businessId,
          status: { in: ["OPEN", "IN_PROGRESS"] },
        },
      }),
      prisma.bug.count({
        where: {
          businessId: context.businessId,
          severity: "CRITICAL",
          status: { in: ["OPEN", "IN_PROGRESS"] },
        },
      }),
      prisma.escalation.count({
        where: {
          businessId: context.businessId,
          status: { in: ["OPEN", "ACKNOWLEDGED", "IN_PROGRESS"] },
        },
      }),
    ]);

    const activeSprintTasks = activeSprint?.tasks.length ?? 0;
    const activeSprintDone =
      activeSprint?.tasks.filter((task) => task.status === "DONE").length ?? 0;
    const daysLeft = activeSprint
      ? Math.max(
          0,
          Math.ceil(
            (activeSprint.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
          ),
        )
      : 0;

    return NextResponse.json({
      openTasks,
      inProgressTasks,
      completedThisWeek,
      openBugs,
      criticalBugs,
      openEscalations,
      activeSprintName: activeSprint?.name ?? null,
      activeSprintProgress:
        activeSprintTasks > 0
          ? Math.round((activeSprintDone / activeSprintTasks) * 100)
          : 0,
      activeSprintDaysLeft: daysLeft,
      deploymentsThisMonth: await prisma.activityLog.count({
        where: {
          businessId: context.businessId,
          entity: "Deployment",
          createdAt: { gte: month.start, lt: month.end },
        },
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch SDE metrics." },
      { status: 500 },
    );
  }
}
