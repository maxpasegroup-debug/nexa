import { redirect } from "next/navigation";

import { SdeBugsPage } from "@/components/sde/sde-bugs-page";
import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { weekBounds } from "@/lib/sde/server";

export default async function SdeBugsRoute() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, name: true, role: true, email: true, businessId: true, business: { select: { name: true } } } });
  if (!user?.businessId || !user.business) redirect("/onboarding");
  const week = weekBounds();
  const [bugs, teamMembers, totalOpen, critical, high, resolvedThisWeek] = await Promise.all([
    prisma.bug.findMany({ where: { businessId: user.businessId }, include: { reporter: { select: { id: true, name: true, role: true } }, assignee: { select: { id: true, name: true, role: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.user.findMany({ where: { businessId: user.businessId }, select: { id: true, name: true, role: true, email: true } }),
    prisma.bug.count({ where: { businessId: user.businessId, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.bug.count({ where: { businessId: user.businessId, severity: "CRITICAL", status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.bug.count({ where: { businessId: user.businessId, severity: "HIGH", status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.bug.count({ where: { businessId: user.businessId, status: "RESOLVED", resolvedAt: { gte: week.start, lt: week.end } } }),
  ]);
  return <SdeBugsPage user={{ id: user.id, name: user.name, role: user.role, email: user.email, businessId: user.businessId, businessName: user.business.name }} initialBugs={bugs.map((bug) => ({ ...bug, createdAt: bug.createdAt.toISOString(), updatedAt: bug.updatedAt.toISOString(), resolvedAt: bug.resolvedAt?.toISOString() ?? null }))} teamMembers={teamMembers} metrics={{ totalOpen, critical, high, resolvedThisWeek }} />;
}
