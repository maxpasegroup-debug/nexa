import { redirect } from "next/navigation";

import { SdeSprintPage } from "@/components/sde/sde-sprint-page";
import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SdeSprintRoute() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, name: true, role: true, email: true, businessId: true, business: { select: { name: true } } } });
  if (!user?.businessId || !user.business) redirect("/onboarding");
  const [sprints, active] = await Promise.all([
    prisma.sprint.findMany({ where: { businessId: user.businessId }, include: { tasks: true, _count: { select: { tasks: true } } }, orderBy: { startDate: "desc" } }),
    prisma.sprint.findFirst({ where: { businessId: user.businessId, status: "ACTIVE" }, include: { tasks: { include: { assignee: { select: { id: true, name: true, role: true } }, sprint: { select: { id: true, name: true } } } } } }),
  ]);
  const serializeTask = (task: NonNullable<typeof active>["tasks"][number]) => ({ ...task, dueDate: task.dueDate?.toISOString() ?? null, createdAt: task.createdAt.toISOString(), updatedAt: task.updatedAt.toISOString() });
  return <SdeSprintPage user={{ id: user.id, name: user.name, role: user.role, email: user.email, businessId: user.businessId, businessName: user.business.name }} initialSprints={sprints.map((sprint) => ({ ...sprint, startDate: sprint.startDate.toISOString(), endDate: sprint.endDate.toISOString(), taskCount: sprint._count.tasks, completedTaskCount: sprint.tasks.filter((task) => task.status === "DONE").length }))} activeSprint={active ? { ...active, startDate: active.startDate.toISOString(), endDate: active.endDate.toISOString(), tasks: active.tasks.map(serializeTask) } : null} />;
}
