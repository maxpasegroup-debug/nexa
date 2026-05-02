export type BDMLeadStatus = "NEW" | "CONTACTED" | "FOLLOW_UP" | "ONBOARDING" | "LOST";

export type LeadNoteView = {
  id: string;
  content: string;
  callDuration?: number | null;
  noteType: string;
  createdAt: string;
  author?: {
    id: string;
    name: string;
  } | null;
};

export type SimpleLead = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  company?: string | null;
  source: string;
  status?: string;
  bdmStatus: BDMLeadStatus;
  lostReason?: string | null;
  followUpDate?: string | null;
  followUpTime?: string | null;
  lastContactedAt?: string | null;
  daysSinceContact?: number | null;
  onboardingStarted?: boolean;
  onboardingSessionId?: string | null;
  callNotes: LeadNoteView[];
  createdAt?: string;
  updatedAt?: string;
};

export const bdmStatuses: Array<{
  value: BDMLeadStatus;
  label: string;
  short: string;
  color: string;
}> = [
  { value: "NEW", label: "New", short: "N", color: "#71717a" },
  { value: "CONTACTED", label: "Contacted", short: "C", color: "#7C6FFF" },
  { value: "FOLLOW_UP", label: "Follow Up", short: "F", color: "#F5A623" },
  { value: "ONBOARDING", label: "Onboarding", short: "O", color: "#22D9A0" },
  { value: "LOST", label: "Lost", short: "L", color: "#FF6B6B" },
];
