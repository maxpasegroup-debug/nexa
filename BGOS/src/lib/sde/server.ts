import type {
  BugStatus,
  EscalationStatus,
  EscalationType,
  Priority,
  Severity,
  SprintStatus,
  TaskStatus,
} from "@prisma/client";
import { NextResponse } from "next/server";

import auth from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getSdeContext() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      businessId: true,
    },
  });

  if (!user?.businessId) {
    return {
      error: NextResponse.json(
        { error: "Business not found for this user." },
        { status: 400 },
      ),
    };
  }

  return { user, businessId: user.businessId };
}

export function weekBounds(date = new Date()) {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return { start, end };
}

export function monthBounds(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);

  return { start, end };
}

const taskStatuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];
const priorities: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const sprintStatuses: SprintStatus[] = [
  "PLANNING",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
];
const severities: Severity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const bugStatuses: BugStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "WONT_FIX",
];
const escalationTypes: EscalationType[] = [
  "BUG",
  "INTEGRATION",
  "FEATURE_REQUEST",
  "SECURITY",
  "PERFORMANCE",
  "OTHER",
];
const escalationStatuses: EscalationStatus[] = [
  "OPEN",
  "ACKNOWLEDGED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

export function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === "string" && taskStatuses.includes(value as TaskStatus);
}

export function isPriority(value: unknown): value is Priority {
  return typeof value === "string" && priorities.includes(value as Priority);
}

export function isSprintStatus(value: unknown): value is SprintStatus {
  return typeof value === "string" && sprintStatuses.includes(value as SprintStatus);
}

export function isSeverity(value: unknown): value is Severity {
  return typeof value === "string" && severities.includes(value as Severity);
}

export function isBugStatus(value: unknown): value is BugStatus {
  return typeof value === "string" && bugStatuses.includes(value as BugStatus);
}

export function isEscalationType(value: unknown): value is EscalationType {
  return typeof value === "string" && escalationTypes.includes(value as EscalationType);
}

export function isEscalationStatus(value: unknown): value is EscalationStatus {
  return (
    typeof value === "string" &&
    escalationStatuses.includes(value as EscalationStatus)
  );
}

export function priorityOrder(priority: Priority) {
  return { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }[priority];
}

export function severityOrder(severity: Severity) {
  return { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }[severity];
}
