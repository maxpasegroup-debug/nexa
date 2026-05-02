import type { BusinessStatus, Prisma } from "@prisma/client";

import { getInternalBusiness } from "@/lib/onboarding-flow";
import { prisma } from "@/lib/prisma";

const activeAccessStatuses: BusinessStatus[] = ["TRIAL", "ACTIVE", "RENEWAL_FAILED"];
const payingCustomerStatuses: BusinessStatus[] = [
  "ACTIVE",
  "RENEWAL_FAILED",
  "SUSPENDED",
];
export const customerListStatuses: BusinessStatus[] = [
  "TRIAL",
  "ACTIVE",
  "RENEWAL_FAILED",
  "SUSPENDED",
];
export const onboardingPipelineStatuses: BusinessStatus[] = [
  "LEAD",
  "ONBOARDING",
  "BUILDING",
  "PREVIEW",
];

function addDays(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export async function transitionBusinessStatus(
  businessId: string,
  newStatus: BusinessStatus,
  reason?: string,
) {
  const existing = await prisma.business.findUnique({
    where: { id: businessId },
    select: { firstPaymentAt: true, name: true },
  });

  const now = new Date();
  const data: Prisma.BusinessUpdateInput = {
    status: newStatus,
    statusUpdatedAt: now,
  };

  if (newStatus === "TRIAL") {
    data.trialStartedAt = now;
    data.trialEndsAt = addDays(7);
  }

  if (newStatus === "ACTIVE") {
    data.firstPaymentAt = existing?.firstPaymentAt ?? now;
    data.lastPaymentAt = now;
    data.renewalFailedAt = null;
    data.gracePeriodEndsAt = null;
  }

  if (newStatus === "RENEWAL_FAILED") {
    data.renewalFailedAt = now;
    data.gracePeriodEndsAt = addDays(3);
  }

  if (newStatus === "SUSPENDED") {
    data.suspendedAt = now;
  }

  if (newStatus === "OFFBOARDED") {
    data.offboardedAt = now;
    data.dataPreservedUntil = addDays(90);
  }

  const business = await prisma.business.update({
    where: { id: businessId },
    data,
    include: { users: { where: { role: "BOSS" } } },
  });

  const internalBusiness = await getInternalBusiness();
  if (internalBusiness) {
    await prisma.nexaInsight.create({
      data: {
        businessId: internalBusiness.id,
        type: "STATUS_CHANGE",
        message: `${business.name} -> ${newStatus}${reason ? `. ${reason}` : ""}`,
        action: ["RENEWAL_FAILED", "SUSPENDED"].includes(newStatus)
          ? "Review customer risk"
          : "Track customer lifecycle",
      },
    });
  }

  return business;
}

export function hasActiveAccess(status: BusinessStatus): boolean {
  return activeAccessStatuses.includes(status);
}

export function isPayingCustomer(status: BusinessStatus): boolean {
  return payingCustomerStatuses.includes(status);
}

export function showInCustomerList(status: BusinessStatus): boolean {
  return customerListStatuses.includes(status);
}

export function showInOnboardingPipeline(status: BusinessStatus): boolean {
  return onboardingPipelineStatuses.includes(status);
}
