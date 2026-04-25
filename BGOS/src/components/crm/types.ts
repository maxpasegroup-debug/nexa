export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "DEMO"
  | "PROPOSAL"
  | "WON"
  | "LOST";

export type CrmAssignee = {
  id?: string;
  name: string;
  role: string;
} | null;

export type CrmLead = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  company?: string | null;
  source: string;
  status: LeadStatus;
  score: number;
  scoreReason?: string | null;
  value: number;
  notes?: string | null;
  assignedTo?: string | null;
  assignee?: CrmAssignee;
  followUpDate?: string | Date | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
};
