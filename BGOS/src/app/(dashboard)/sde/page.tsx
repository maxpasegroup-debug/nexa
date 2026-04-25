import { redirect } from "next/navigation";

import { SdeDashboard } from "@/components/sde/sde-dashboard";
import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { monthBounds, weekBounds } from "@/lib/sde/server";

async function getMetrics(userId: string, businessId: string) {
  const week = weekBounds();
  const month = monthBounds();
  const activeSprint = await prisma.sprint.findFirst({
    where: { businessId, status: "ACTIVE" },
    include: { tasks: { select: { status: true } } },
  });
  const [openTasks, inProgressTasks, completedThisWeek, openBugs, criticalBugs, openEscalations, deploymentsThisMonth] = await Promise.all([
    prisma.task.count({ where: { assignedTo: userId, status: { not: "DONE" } } }),
    prisma.task.count({ where: { assignedTo: userId, status: "IN_PROGRESS" } }),
    prisma.task.count({ where: { assignedTo: userId, status: "DONE", updatedAt: { gte: week.start, lt: week.end } } }),
    prisma.bug.count({ where: { businessId, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.bug.count({ where: { businessId, severity: "CRITICAL", status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.escalation.count({ where: { businessId, status: { in: ["OPEN", "ACKNOWLEDGED", "IN_PROGRESS"] } } }),
    prisma.activityLog.count({ where: { businessId, entity: "Deployment", createdAt: { gte: month.start, lt: month.end } } }),
  ]);
  const total = activeSprint?.tasks.length ?? 0;
  const done = activeSprint?.tasks.filter((task) => task.status === "DONE").length ?? 0;
  return { openTasks, inProgressTasks, completedThisWeek, openBugs, criticalBugs, openEscalations, activeSprintName: activeSprint?.name ?? null, activeSprintProgress: total > 0 ? Math.round((done / total) * 100) : 0, activeSprintDaysLeft: activeSprint ? Math.max(0, Math.ceil((activeSprint.endDate.getTime() - Date.now()) / 86400000)) : 0, deploymentsThisMonth };
}

export default async function SdePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, name: true, email: true, role: true, businessId: true, business: { select: { name: true } } } });
  if (!user?.businessId || !user.business) redirect("/onboarding");
  const [initialMetrics, tasks, bugs, activeSprint, sprints, escalations, integrations, teamMembers] = await Promise.all([
    getMetrics(user.id, user.businessId),
    prisma.task.findMany({ where: { assignedTo: user.id }, include: { assignee: { select: { id: true, name: true, role: true } }, sprint: { select: { id: true, name: true } } }, orderBy: { updatedAt: "desc" } }),
    prisma.bug.findMany({ where: { businessId: user.businessId, status: { in: ["OPEN", "IN_PROGRESS"] } }, include: { reporter: { select: { id: true, name: true, role: true } }, assignee: { select: { id: true, name: true, role: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.sprint.findFirst({ where: { businessId: user.businessId, status: "ACTIVE" }, include: { tasks: { include: { assignee: { select: { id: true, name: true, role: true } }, sprint: { select: { id: true, name: true } } } } } }),
    prisma.sprint.findMany({ where: { businessId: user.businessId }, include: { tasks: true, _count: { select: { tasks: true } } }, orderBy: { startDate: "desc" } }),
    prisma.escalation.findMany({ where: { businessId: user.businessId, status: { in: ["OPEN", "ACKNOWLEDGED", "IN_PROGRESS"] } }, include: { raiser: { select: { id: true, name: true, role: true } }, resolver: { select: { id: true, name: true, role: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.integrationHealth.findMany({ where: { businessId: user.businessId }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { businessId: user.businessId }, select: { id: true, name: true, role: true, email: true } }),
  ]);
  const serializeTask = (task: typeof tasks[number]) => ({ ...task, dueDate: task.dueDate?.toISOString() ?? null, createdAt: task.createdAt.toISOString(), updatedAt: task.updatedAt.toISOString() });
  const serializeBug = (bug: typeof bugs[number]) => ({ ...bug, createdAt: bug.createdAt.toISOString(), updatedAt: bug.updatedAt.toISOString(), resolvedAt: bug.resolvedAt?.toISOString() ?? null });
  const serializeEscalation = (item: typeof escalations[number]) => ({ ...item, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString(), resolvedAt: item.resolvedAt?.toISOString() ?? null });
  return <SdeDashboard user={{ id: user.id, name: user.name, role: user.role, email: user.email, businessId: user.businessId, businessName: user.business.name }} initialMetrics={initialMetrics} initialTasks={tasks.map(serializeTask)} initialBugs={bugs.map(serializeBug)} activeSprint={activeSprint ? { ...activeSprint, startDate: activeSprint.startDate.toISOString(), endDate: activeSprint.endDate.toISOString(), createdAt: undefined, updatedAt: undefined, tasks: activeSprint.tasks.map(serializeTask) } : null} initialSprints={sprints.map((sprint) => ({ ...sprint, startDate: sprint.startDate.toISOString(), endDate: sprint.endDate.toISOString(), taskCount: sprint._count.tasks, completedTaskCount: sprint.tasks.filter((task) => task.status === "DONE").length }))} initialEscalations={escalations.map(serializeEscalation)} initialIntegrations={integrations.map((item) => ({ ...item, lastChecked: item.lastChecked.toISOString(), createdAt: undefined, updatedAt: undefined }))} teamMembers={teamMembers} />;
}
