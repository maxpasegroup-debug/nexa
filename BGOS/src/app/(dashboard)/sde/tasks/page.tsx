import { redirect } from "next/navigation";

import { MobileSDETasks } from "@/components/sde/mobile/mobile-sde-tasks";
import { TaskBoard } from "@/components/sde/task-board";
import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SdeTasksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, businessId: true },
  });

  if (!user?.businessId) redirect("/onboarding");

  const tasks = await prisma.task.findMany({
    where: { assignedTo: user.id },
    include: {
      assignee: { select: { id: true, name: true, role: true } },
      sprint: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const serializedTasks = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate?.toISOString() ?? null,
    assignedTo: task.assignedTo,
    assignee: task.assignee,
    sprintId: task.sprintId,
    sprint: task.sprint,
    storyPoints: task.storyPoints,
    blockedBy: task.blockedBy,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }));

  return (
    <>
      <div className="show-mobile hidden">
        <MobileSDETasks tasks={serializedTasks} />
      </div>
      <div className="hide-mobile min-h-screen bg-[#070709] p-8 text-white">
        <section className="rounded-2xl border border-white/10 bg-[#13131c] p-5">
          <h1 className="mb-4 font-heading text-lg font-bold">Tasks</h1>
          <TaskBoard tasks={serializedTasks} sprints={[]} onTaskUpdate={() => undefined} onTaskCreate={() => undefined} />
        </section>
      </div>
    </>
  );
}
