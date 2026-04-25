export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type SprintStatus = "PLANNING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type BugStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "WONT_FIX";
export type EscalationType =
  | "BUG"
  | "INTEGRATION"
  | "FEATURE_REQUEST"
  | "SECURITY"
  | "PERFORMANCE"
  | "OTHER";
export type EscalationStatus =
  | "OPEN"
  | "ACKNOWLEDGED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

export type SdeUser = {
  id: string;
  name: string;
  role?: string;
  email?: string;
};

export type SdeSprint = {
  id: string;
  name: string;
  goal?: string | null;
  startDate: string | Date;
  endDate: string | Date;
  status: SprintStatus;
  taskCount?: number;
  completedTaskCount?: number;
  velocity?: number;
  tasks?: SdeTask[];
};

export type SdeTask = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string | Date | null;
  assignedTo: string;
  assignee?: SdeUser | null;
  sprintId?: string | null;
  sprint?: Pick<SdeSprint, "id" | "name"> | null;
  storyPoints: number;
  blockedBy?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type SdeBug = {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: BugStatus;
  reportedBy: string;
  reporter?: SdeUser | null;
  assignedTo?: string | null;
  assignee?: SdeUser | null;
  stepsToRepro?: string | null;
  resolution?: string | null;
  resolvedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
};

export type IntegrationHealthItem = {
  id: string;
  name: string;
  type: string;
  status: string;
  lastChecked: string | Date;
  lastError?: string | null;
  responseTime?: number | null;
};

export type SdeEscalation = {
  id: string;
  type: EscalationType;
  title: string;
  description: string;
  priority: Priority;
  status: EscalationStatus;
  raisedBy: string;
  raiser?: SdeUser | null;
  resolvedBy?: string | null;
  resolver?: SdeUser | null;
  resolution?: string | null;
  notifiedDev?: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
  resolvedAt?: string | Date | null;
};
