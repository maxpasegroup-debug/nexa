export type MarketplaceAgentView = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  type?: "UI" | "BACKGROUND";
  icon: string;
  colorPrimary: string;
  colorSecondary: string;
  gradient: string;
  onboardingFee: number;
  monthlyFee: number;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  features: unknown;
  benefits: unknown;
  howItWorks: unknown;
  stats: unknown;
  metaTitle?: string | null;
  metaDesc?: string | null;
  installed?: boolean;
  installStatus?: string | null;
  installationId?: string | null;
};

export type AgentOfferView = {
  id: string;
  agentId?: string | null;
  name: string;
  description: string;
  offerType: string;
  discount: number;
  isCombo: boolean;
  comboAgents: unknown;
  targetPlan?: string | null;
  targetIndustry?: string | null;
  validFrom: string;
  validUntil?: string | null;
  isActive: boolean;
  usageCount: number;
  secondsUntilExpiry?: number | null;
};

export type AgentInstallationView = {
  id: string;
  agentId: string;
  businessId: string;
  status: string;
  onboardingFeePaid: boolean;
  monthlyFeePaid: boolean;
  razorpaySetupId?: string | null;
  razorpayMandateId?: string | null;
  installedAt?: string | null;
  activeFrom?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  sdeAssignedId?: string | null;
  sdeCompletedAt?: string | null;
  whitelabelName?: string | null;
  whitelabelIcon?: string | null;
  isWhitelabeled: boolean;
  createdAt: string;
  updatedAt: string;
  agent: MarketplaceAgentView;
};

export type BenefitItem = {
  icon?: string;
  title?: string;
  desc?: string;
  description?: string;
};

export type StepItem = {
  step?: string;
  icon?: string;
  title?: string;
  desc?: string;
  description?: string;
};
