import type { BlizzwayBusinessModel } from "./business-context";

export type ApiResponse<T> = T;

export type ISODateString = string;

export type BlizzwayUserProfile = {
  id: string;
  name: string | null;
  email: string | null;
  role?: string | null;
  businessId?: string | null;
  businessModel: BlizzwayBusinessModel;
};

export type BgosSessionResponse = {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    role?: string | null;
    businessId?: string | null;
  };
  expires?: string;
};

export type AuthSessionResponse = BgosSessionResponse;

export type BlizzwayMetricsResponse = {
  metrics: {
    careerScore: number | null;
    walletBalance: number;
    credits: number;
    tasksCompleted: number;
  };
};

export type BlizzwayPathwayStep = {
  id: string;
  title: string;
  status: "locked" | "available" | "active" | "completed";
  progress: number;
  dueAt?: ISODateString | null;
};

export type BlizzwayPathwayResponse = {
  pathway: {
    id: string;
    title: string;
    currentStepId?: string | null;
    progress: number;
    steps: BlizzwayPathwayStep[];
  };
};

export type LearningGardenItem = {
  id: string;
  title: string;
  type: string;
  status: "not_started" | "in_progress" | "completed";
  progress: number;
};

export type LearningGardenResponse = {
  garden: {
    items: LearningGardenItem[];
    activeCount: number;
    completedCount: number;
  };
};

export type EarningUniverseOpportunity = {
  id: string;
  title: string;
  category: string;
  status: "suggested" | "saved" | "active" | "completed";
  estimatedValue?: number | null;
};

export type EarningUniverseResponse = {
  universe: {
    opportunities: EarningUniverseOpportunity[];
    activeCount: number;
    completedCount: number;
  };
};

export type BlizzwayHealthResponse = {
  status: "healthy";
  module: "blizzway" | "Blizzway";
  businessModel?: BlizzwayBusinessModel;
  timestamp: string;
};

export type BlizzwayAgent = {
  id: string;
  slug: string;
  name: string;
  category: string;
  type: string | null;
  creditPrice: number;
  description: string;
  icon: string;
  status: string;
  isPrebuilt: boolean;
  isRequestable: boolean;
  canAddToGrowthBoard: boolean;
  colorPrimary: string;
  colorSecondary: string;
  gradient: string;
  isFeatured?: boolean;
  sortOrder?: number;
};

export type BlizzwayAgentsResponse = {
  agents: BlizzwayAgent[];
  total: number;
  featured: BlizzwayAgent | null;
};

export type MagicMarketResponse = BlizzwayAgentsResponse;

export type CompanionsResponse = {
  companions: BlizzwayAgent[];
  total: number;
  featured: BlizzwayAgent | null;
};

export type QuickBoost = {
  id: string;
  title: string;
  description: string;
  category?: string;
  creditPrice: number;
  status: "available" | "coming_soon" | "archived";
};

export type QuickBoostsResponse = {
  boosts: QuickBoost[];
  total: number;
};

export type BlizzwayGrowthBoardItem = {
  id: string;
  path: "learning" | "earning";
  status: string;
  addedAt: string;
  deactivatedAt: string | null;
  agent: BlizzwayAgent;
};

export type BlizzwayGrowthBoardResponse = {
  board: {
    learning: BlizzwayGrowthBoardItem[];
    earning: BlizzwayGrowthBoardItem[];
    inactive: BlizzwayGrowthBoardItem[];
  };
  activeCounts: {
    learning: number;
    earning: number;
    total: number;
  };
  marketplaceAgents: BlizzwayAgent[];
  wallet: BlizzwayCreditWallet;
  paymentModeEnabled: boolean;
  nexaRecommendation: string;
};

export type BlizzwayCreditWallet = {
  id: string;
  businessId: string;
  userId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
};

export type BlizzwayWalletTransaction = {
  id: string;
  type: "Earned" | "Spent";
  amount: number;
  description: string;
  businessModel: "Blizzway" | string;
  date: string;
};

export type BlizzwayWalletResponse = {
  wallet: {
    primaryBalance: number;
    credits: number;
    recentTransactions: BlizzwayWalletTransaction[];
  };
  payment: {
    enabledGateways: string[];
    defaultGateway: string;
    currency: string;
  };
};

export type BlizzwayWalletTopUpRequest = {
  gateway?: string;
  amount?: number;
  credits?: number;
};

export type BlizzwayWalletTopUpResponse = {
  wallet: {
    primaryBalance: number;
    credits: number;
  };
  payment: unknown;
  checkout: unknown;
};

export type SoulVaultItem = {
  id: string;
  title: string;
  type: string;
  issuedAt?: ISODateString | null;
  metadata?: Record<string, unknown>;
};

export type BlizzwayVisionBoard = {
  sixMonths: string;
  oneYear: string;
  threeYears: string;
  fiveYears: string;
};

export type BlizzwayVaultPayload = {
  onboardingAnswers: Record<string, string>;
  digitalProfile: {
    stage: string;
    summary: string;
    strengths: string[];
  };
  dreamGoals: string[];
  visionBoard: BlizzwayVisionBoard;
  updatedAt?: string;
};

export type SoulVaultResponse = {
  vault: {
    certificates: number;
    achievements: number;
    tier: string;
    vaultItems: SoulVaultItem[];
    onboardingAnswers?: Record<string, string>;
    digitalProfile?: BlizzwayVaultPayload["digitalProfile"];
    dreamGoals?: string[];
    visionBoard?: BlizzwayVisionBoard;
    updatedAt?: string;
  };
};

export type BlizzwayNexaMessage = {
  role: "user" | "assistant";
  content: string;
};

export type BlizzwayNexaRecommendation = {
  id: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  confidence?: number;
  source?: "placeholder" | "bgos";
};

export type BlizzwayNexaRequest = {
  message?: string;
  quickAction?: string;
  history?: BlizzwayNexaMessage[];
  conversationId?: string;
  memory?: Record<string, unknown>;
  recommendations?: BlizzwayNexaRecommendation[];
};

export type BlizzwayNexaResponse = {
  message: string;
  chips: string[];
  conversationId?: string;
  memory?: Record<string, unknown>;
  recommendations?: BlizzwayNexaRecommendation[];
};

export type BlizzwayBdpResponse = {
  bdp: {
    id: string;
    profileStrength: number;
    assessmentsCompleted: number;
    walletCredits: number;
    metrics: {
      iq: number | null;
      eq: number | null;
      cq: number | null;
      aq: number | null;
      lq: number | null;
      admissionsReadiness: number;
    };
    studyGoals: string[];
    countryPreferences: string[];
    documentsReadiness: {
      status: string;
      completed: number;
      total: number;
      items: string[];
    };
    scholarshipReadiness: {
      status: string;
      score: number;
      suggestions: string[];
    };
    publicPreview: {
      headline: string;
      summary: string;
      strengths: string[];
    };
    nexaSuggestions: string[];
    updatedAt: string;
  };
};

export type BlizzwayAssessment = {
  slug: string;
  title: string;
  category: string;
  description: string;
  purpose: string;
  measures: string[];
  timeRequired: string;
  creditCost: number;
  bdpImpact: string;
  repeatable: boolean;
  nexaRecommendation: string;
  status: string;
  admissionsSignal: boolean;
};

export type BlizzwayAssessmentsResponse = {
  assessments: BlizzwayAssessment[];
  total: number;
  completed: unknown[];
  recommended: BlizzwayAssessment[];
  bdpImpact: {
    profileStrength: number;
    admissionsReadiness: number;
    message: string;
  };
};

export type BlizzwayAdmissionPathway = {
  slug: string;
  title: string;
  location: string;
  countryRegion: string;
  level: string;
  mode: string;
  intakeDeadline: string;
  eligibilityStatus: string;
  credits: string;
  eligibilitySummary: string;
  documents: string[];
  deadlines: string[];
  budget: string;
  scholarships: string[];
  nexaAdvice: string;
  recommendedAssessments: string[];
  recommendedCompanions: string[];
};

export type BlizzwayAdmissionsResponse = {
  pathways: BlizzwayAdmissionPathway[];
  total: number;
  shortlist: unknown[];
  readiness: {
    academicFit: number;
    globalFit: number;
    documents: BlizzwayBdpResponse["bdp"]["documentsReadiness"];
    scholarships: BlizzwayBdpResponse["bdp"]["scholarshipReadiness"];
  };
  nexaRecommendation: string;
};
