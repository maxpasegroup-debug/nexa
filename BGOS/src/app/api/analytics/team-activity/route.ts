import { NextResponse } from "next/server";

import { getCurrentBusiness } from "@/lib/dashboard/server";
import { prisma } from "@/lib/prisma";

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function lastSevenDays() {
  const today = startOfDay(new Date());
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return date;
  });
}

export async function GET() {
  try {
    const context = await getCurrentBusiness();
    if (context.error) return context.error;

    const days = lastSevenDays();
    const start = days[0];
    const end = new Date(days[6]);
    end.setDate(end.getDate() + 1);

    const users = await prisma.user.findMany({
      where: { businessId: context.business.id },
      select: { id: true, name: true, role: true },
      orderBy: { name: "asc" },
    });

    const data = await Promise.all(
      users.map(async (user) => {
        const [activities, callsThisWeek, tasksCompletedThisWeek] =
          await Promise.all([
            prisma.activityLog.findMany({
              where: {
                businessId: context.business.id,
                userId: user.id,
                createdAt: { gte: start, lt: end },
              },
              select: { createdAt: true },
            }),
            prisma.callLog.count({
              where: { userId: user.id, createdAt: { gte: start, lt: end } },
            }),
            prisma.task.count({
              where: {
                assignedTo: user.id,
                status: "DONE",
                updatedAt: { gte: start, lt: end },
              },
            }),
          ]);
        const activityCount = days.map((day) => {
          const next = new Date(day);
          next.setDate(day.getDate() + 1);
          return activities.filter(
            (activity) => activity.createdAt >= day && activity.createdAt < next,
          ).length;
        });

        return {
          name: user.name,
          role: user.role,
          activityCount,
          totalThisWeek: activityCount.reduce((sum, count) => sum + count, 0),
          callsThisWeek,
          tasksCompletedThisWeek,
        };
      }),
    );

    return NextResponse.json({
      days: days.map((day) =>
        new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(day),
      ),
      data,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch team activity." },
      { status: 500 },
    );
  }
}
