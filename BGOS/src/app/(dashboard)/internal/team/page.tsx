import { requireInternalOwner } from "@/lib/internal-owner";
import { prisma } from "@/lib/prisma";
import { TeamManagementPage } from "@/components/internal/team-management-page";
import type { EmployeeListItem } from "@/components/internal/employee-list";

function latestDate(...values: Array<Date | null | undefined>) {
  const timestamps = values
    .filter((value): value is Date => Boolean(value))
    .map((value) => value.getTime());

  if (timestamps.length === 0) return null;
  return new Date(Math.max(...timestamps));
}

export default async function InternalTeamPage() {
  const { owner, business } = await requireInternalOwner();

  const employees = await prisma.user.findMany({
    where: {
      businessId: business.id,
      role: { in: ["BDM", "SDE"] },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      defaultPassword: true,
      activityLogs: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
      leadActivities: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
      callLogs: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
      tasks: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: { updatedAt: true },
      },
    },
  });

  const serializedEmployees: EmployeeListItem[] = employees.map((employee) => {
    const lastLoginAt = latestDate(
      employee.activityLogs[0]?.createdAt,
      employee.leadActivities[0]?.createdAt,
      employee.callLogs[0]?.createdAt,
      employee.tasks[0]?.updatedAt,
      employee.updatedAt,
    );

    return {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      createdAt: employee.createdAt.toISOString(),
      defaultPassword: employee.defaultPassword,
      lastLoginAt: lastLoginAt?.toISOString() ?? null,
    };
  });

  return (
    <TeamManagementPage
      user={{
        id: owner.id,
        name: owner.name,
        email: owner.email,
        role: owner.role,
      }}
      employees={serializedEmployees}
    />
  );
}
