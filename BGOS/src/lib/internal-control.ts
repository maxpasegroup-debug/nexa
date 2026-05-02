import type { Business, Prisma, Role, User } from "@prisma/client";

import { planMonthlyAmount } from "@/lib/onboarding-flow";
import { prisma } from "@/lib/prisma";

export const VALID_ROLES: Role[] = ["OWNER", "BOSS", "BDM", "SDE", "ADMIN"];

export function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function daysBetweenNow(date: Date | null | undefined) {
  if (!date) return null;
  return Math.ceil((date.getTime() - Date.now()) / 86400000);
}

export function daysSince(date: Date | null | undefined) {
  if (!date) return 9999;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000));
}

export function latestDate(...values: Array<Date | null | undefined>) {
  const timestamps = values
    .filter((value): value is Date => Boolean(value))
    .map((value) => value.getTime());
  return timestamps.length ? new Date(Math.max(...timestamps)) : null;
}

export function csvEscape(value: unknown) {
  const text = value instanceof Date ? value.toISOString() : String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export function normalizeCustomerStatus(
  business: Pick<Business, "status"> & {
    trialSubscription?: { status: string; trialEndsAt: Date | null } | null;
  },
) {
  if (business.status === "SUSPENDED" || business.status === "OFFBOARDED") {
    return business.status;
  }
  if (business.trialSubscription?.status === "ACTIVE") return "ACTIVE";
  if (business.trialSubscription?.status === "TRIAL") return "TRIAL";
  return business.status || "TRIAL";
}

export function planForBusiness(
  business: { trialSubscription?: { plan: string; monthlyAmount: number } | null; users?: unknown[] },
) {
  if (business.trialSubscription?.plan) return business.trialSubscription.plan;
  const count = Array.isArray(business.users) ? business.users.length : 0;
  if (count >= 20) return "SCALE";
  if (count >= 6) return "GROWTH";
  return "STARTER";
}

export function mrrForPlan(plan: string, monthlyAmount?: number | null) {
  return monthlyAmount ?? planMonthlyAmount(plan);
}

export function ownerWhere(internalBusinessId: string): Prisma.BusinessWhereInput {
  return { id: { not: internalBusinessId } };
}

export async function findInternalBusinessId() {
  const business = await prisma.business.findFirst({
    where: { name: "BGOS" },
    select: { id: true },
  });
  return business?.id ?? "";
}

export async function employeeStats(userId: string, month = new Date().getMonth() + 1, year = new Date().getFullYear()) {
  const [activeLeads, totalLeads, commissions, builds, activeBuilds, ticketsAssigned, ticketsResolved, target] =
    await Promise.all([
      prisma.lead.count({
        where: { assignedTo: userId, status: { notIn: ["WON", "LOST"] } },
      }),
      prisma.lead.count({ where: { assignedTo: userId } }),
      prisma.commission.aggregate({
        where: { userId, month, year, status: { not: "CLAWBACK" } },
        _sum: { commissionAmt: true },
      }),
      prisma.onboardingSession.count({ where: { sdeId: userId } }),
      prisma.onboardingSession.count({
        where: {
          sdeId: userId,
          status: { in: ["SUBMITTED", "SDE_BUILDING", "CLARIFICATION_NEEDED"] },
        },
      }),
      prisma.task.count({ where: { assignedTo: userId, status: { not: "DONE" } } }),
      prisma.task.count({ where: { assignedTo: userId, status: "DONE" } }),
      prisma.target.findUnique({ where: { userId_month_year: { userId, month, year } } }),
    ]);

  return {
    activeLeads,
    totalLeads,
    commissionThisMonth: commissions._sum.commissionAmt ?? 0,
    buildsCount: builds,
    activeBuilds,
    ticketsAssigned,
    ticketsResolved,
    revenueTarget: target?.revenueTarget ?? 0,
  };
}

export function serializeEmployee(user: Pick<User, "id" | "name" | "email" | "role" | "active" | "status" | "phone" | "createdAt" | "updatedAt" | "joinedAt" | "defaultPassword">, stats: Awaited<ReturnType<typeof employeeStats>>) {
  return {
    id: user.id,
    name: user.name,
    displayName: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.active,
    active: user.active,
    status: user.status || (user.active ? "ACTIVE" : "ARCHIVED"),
    createdAt: user.createdAt.toISOString(),
    joinedAt: (user.joinedAt ?? user.createdAt).toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    defaultPassword: user.defaultPassword,
    lastLoginAt: user.updatedAt.toISOString(),
    ...stats,
  };
}

export async function getCustomerRows(internalBusinessId: string, filters: URLSearchParams) {
  const search = filters.get("search")?.trim();
  const status = filters.get("status")?.trim();
  const plan = filters.get("plan")?.trim();
  const bdmId = filters.get("bdmId")?.trim();
  const churnRiskOnly = filters.get("churnRiskOnly") === "true";

  const businesses = await prisma.business.findMany({
    where: {
      ...ownerWhere(internalBusinessId),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { clientId: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      users: {
        select: { id: true, name: true, email: true, role: true, active: true, updatedAt: true },
      },
      trialSubscription: true,
      leads: { select: { id: true, assignedTo: true, status: true } },
      bugs: { where: { status: { in: ["OPEN", "IN_PROGRESS"] } }, select: { id: true } },
      escalations: { where: { status: { in: ["OPEN", "ACKNOWLEDGED", "IN_PROGRESS"] } }, select: { id: true } },
      onboardingLead: {
        select: {
          assignedBDMId: true,
          assignedBDM: { select: { id: true, name: true } },
        },
      },
    },
  });

  const rows = businesses.map((business) => {
    const customerStatus = normalizeCustomerStatus(business);
    const customerPlan = planForBusiness(business);
    const mrr = customerStatus === "ACTIVE" || customerStatus === "TRIAL"
      ? mrrForPlan(customerPlan, business.trialSubscription?.monthlyAmount)
      : 0;
    const lastLoginAt = latestDate(...business.users.map((user) => user.updatedAt));
    const daysSinceLastLogin = daysSince(lastLoginAt);
    const openTickets = business.bugs.length + business.escalations.length;
    const bdm =
      business.onboardingLead?.assignedBDM ??
      (business.leads.find((lead) => lead.assignedTo)?.assignedTo
        ? { id: business.leads.find((lead) => lead.assignedTo)?.assignedTo ?? "", name: "BDM" }
        : null);

    return {
      id: business.id,
      clientId: business.clientId ?? business.id.slice(0, 8).toUpperCase(),
      name: business.name,
      plan: customerPlan,
      status: customerStatus as "TRIAL" | "ACTIVE" | "SUSPENDED" | "OFFBOARDED",
      healthScore: business.healthScore,
      mrr,
      trialEndsAt: business.trialSubscription?.trialEndsAt ?? null,
      daysUntilTrialExpiry: daysBetweenNow(business.trialSubscription?.trialEndsAt),
      lastLoginAt,
      daysSinceLastLogin,
      totalUsers: business.users.length,
      bdmName: bdm?.name ?? "Unassigned",
      bdmId: bdm?.id ?? business.onboardingLead?.assignedBDMId ?? "",
      joinedAt: business.createdAt,
      totalLeads: business.leads.length,
      openTickets,
      avgRating: null as number | null,
      isChurnRisk: daysSinceLastLogin >= 7,
    };
  });

  return rows.filter((row) => {
    if (status && row.status !== status) return false;
    if (plan && row.plan !== plan) return false;
    if (bdmId && row.bdmId !== bdmId) return false;
    if (churnRiskOnly && !row.isChurnRisk) return false;
    return true;
  });
}

export function customerSummary(rows: Awaited<ReturnType<typeof getCustomerRows>>) {
  return {
    total: rows.length,
    active: rows.filter((row) => row.status === "ACTIVE").length,
    trial: rows.filter((row) => row.status === "TRIAL").length,
    suspended: rows.filter((row) => row.status === "SUSPENDED").length,
    totalMRR: rows.reduce((sum, row) => sum + row.mrr, 0),
    atRisk: rows.filter((row) => row.isChurnRisk).length,
    avgHealthScore: rows.length
      ? Math.round(rows.reduce((sum, row) => sum + row.healthScore, 0) / rows.length)
      : 0,
  };
}
