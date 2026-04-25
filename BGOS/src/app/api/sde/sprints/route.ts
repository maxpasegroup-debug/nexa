import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSdeContext } from "@/lib/sde/server";

export async function GET() {
  try {
    const context = await getSdeContext();

    if (context.error) return context.error;

    const sprints = await prisma.sprint.findMany({
      where: { businessId: context.businessId },
      include: {
        _count: { select: { tasks: true } },
        tasks: { select: { status: true } },
      },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json({
      sprints: sprints.map((sprint) => ({
        ...sprint,
        taskCount: sprint._count.tasks,
        completedTaskCount: sprint.tasks.filter((task) => task.status === "DONE")
          .length,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch sprints." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const context = await getSdeContext();

    if (context.error) return context.error;

    const { name, goal, startDate, endDate } = await request.json();

    if (typeof name !== "string" || !startDate || !endDate) {
      return NextResponse.json(
        { error: "name, startDate and endDate are required." },
        { status: 400 },
      );
    }

    const sprint = await prisma.sprint.create({
      data: {
        businessId: context.businessId,
        name,
        goal: typeof goal === "string" ? goal : undefined,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    return NextResponse.json({ sprint }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to create sprint." },
      { status: 500 },
    );
  }
}
