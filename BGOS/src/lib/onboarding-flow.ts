import crypto from "crypto";

import { prisma } from "@/lib/prisma";

export function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function getOptionalString(value: unknown) {
  const text = getString(value);
  return text || undefined;
}

export function addHours(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export function addDays(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export function randomPassword() {
  return crypto.randomBytes(9).toString("base64url");
}

export function previewToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function previewUrl(token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bgos.online";
  return `${baseUrl}/workspace-preview?token=${token}`;
}

export function planMonthlyAmount(plan: string) {
  const normalized = plan.toUpperCase();
  if (normalized === "ENTERPRISE") return 15000;
  if (normalized === "SCALE") return 5000;
  if (normalized === "GROWTH") return 1500;
  return 499;
}

export async function getInternalBusiness() {
  const owner = await prisma.user.findFirst({
    where: { email: "boss@bgos.online", role: "OWNER" },
    select: { businessId: true },
  });

  if (owner?.businessId) {
    return prisma.business.findUnique({ where: { id: owner.businessId } });
  }

  return prisma.business.findFirst({ where: { name: "BGOS" } });
}

export async function findLeastLoadedBDM(businessId: string) {
  const bdms = await prisma.user.findMany({
    where: { businessId, role: "BDM" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      _count: {
        select: {
          bdmOnboardingLeads: {
            where: { status: "BDM_ASSIGNED" },
          },
        },
      },
    },
  });

  return bdms.sort(
    (a, b) => a._count.bdmOnboardingLeads - b._count.bdmOnboardingLeads,
  )[0];
}

export async function findLeastLoadedSDE(businessId: string) {
  const sdes = await prisma.user.findMany({
    where: { businessId, role: "SDE" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      _count: {
        select: {
          sdeOnboardingLeads: {
            where: { status: "SDE_BUILDING" },
          },
        },
      },
    },
  });

  return sdes.sort(
    (a, b) => a._count.sdeOnboardingLeads - b._count.sdeOnboardingLeads,
  )[0];
}
