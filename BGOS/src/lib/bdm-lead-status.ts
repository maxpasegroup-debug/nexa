import type { BDMLeadStatus } from "@prisma/client";

export const bdmLeadStatuses: BDMLeadStatus[] = [
  "NEW",
  "CONTACTED",
  "FOLLOW_UP",
  "ONBOARDING",
  "LOST",
];

export const editableBdmLeadStatuses: BDMLeadStatus[] = [
  "NEW",
  "CONTACTED",
  "FOLLOW_UP",
  "LOST",
];

export function isBdmLeadStatus(value: unknown): value is BDMLeadStatus {
  return typeof value === "string" && bdmLeadStatuses.includes(value as BDMLeadStatus);
}

export function isEditableBdmLeadStatus(value: unknown): value is BDMLeadStatus {
  return typeof value === "string" && editableBdmLeadStatuses.includes(value as BDMLeadStatus);
}

export function bdmLeadStatusLabel(status: BDMLeadStatus) {
  switch (status) {
    case "NEW":
      return "New";
    case "CONTACTED":
      return "Contacted";
    case "FOLLOW_UP":
      return "Follow up";
    case "ONBOARDING":
      return "Onboarding";
    case "LOST":
      return "Lost";
  }
}
