import { requireInternalOwner } from "@/lib/internal-owner";
import { prisma } from "@/lib/prisma";
import { TeamManagementPage } from "@/components/internal/team-management-page";
import { employeeStats, serializeEmployee } from "@/lib/internal-control";

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
      phone: true,
      role: true,
      active: true,
      status: true,
      createdAt: true,
      joinedAt: true,
      archivedAt: true,
      deletedAt: true,
      purgeAfter: true,
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

  const serializedEmployees = await Promise.all(employees.map(async (employee) => {
    const lastLoginAt = latestDate(
      employee.activityLogs[0]?.createdAt,
      employee.leadActivities[0]?.createdAt,
      employee.callLogs[0]?.createdAt,
      employee.tasks[0]?.updatedAt,
      employee.updatedAt,
    );

    return {
      ...serializeEmployee(employee, await employeeStats(employee.id)),
      lastLoginAt: lastLoginAt?.toISOString() ?? null,
    };
  }));

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
