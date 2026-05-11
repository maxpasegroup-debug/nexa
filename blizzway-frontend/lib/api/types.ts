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
    xp?: number;
    level?: number;
    steps: BlizzwayPathwayStep[];
  };
};

export type BlizzwayPathwayLevel = {
  level: number;
  key: string;
  title: string;
  xpRequired: number;
  status: "completed" | "active" | "locked";
};

export type BlizzwayPathwayQuest = {
  key: string;
  title: string;
  description: string;
  level: number;
  xpReward: number;
  achievementKey: string | null;
  status: "completed" | "available";
  completedAt: string | null;
};

export type BlizzwayPathwayAchievement = {
  key: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  rewardCredits: number;
  xpReward: number;
  status: "locked" | "unlocked" | "claimed";
  unlockedAt: string | null;
  claimedAt: string | null;
  claimable: boolean;
};

export type BlizzwayPathwayGamification = {
  levels: BlizzwayPathwayLevel[];
  progress: {
    currentLevel: number;
    currentLevelTitle: string;
    totalXp: number;
    levelXp: number;
    nextLevelXp: number;
    progress: number;
    completedLevels: number[];
  };
  quests: BlizzwayPathwayQuest[];
  achievements: BlizzwayPathwayAchievement[];
  streak: {
    currentCount: number;
    longestCount: number;
    lastCheckInKey: string | null;
    checkedInToday: boolean;
  };
  rewards: {
    available: number;
    walletCredits: number;
  };
  nextQuest: {
    key: string;
    title: string;
    description: string;
    xpReward: number;
    nexaNote: string;
  } | null;
};

export type BlizzwayPathwayGamificationResponse = {
  gamification: BlizzwayPathwayGamification;
};

export type BlizzwayQuestCompleteResponse = {
  quest: { key: string; title: string; xpAwarded: number; completedAt: string; duplicate: boolean };
  achievement: { key: string; status: string; rewardCredits: number } | null;
  gamification: BlizzwayPathwayGamification;
};

export type BlizzwayAchievementsResponse = {
  achievements: BlizzwayPathwayAchievement[];
  rewards: BlizzwayPathwayGamification["rewards"];
  total: number;
};

export type BlizzwayAchievementClaimResponse = {
  achievement: {
    key: string;
    title: string;
    rewardCredits: number;
    status: string;
    claimedAt: string | null;
    duplicate: boolean;
  };
  ledger: { id: string; amount: number; balanceAfter: number; description: string } | null;
  gamification: BlizzwayPathwayGamification;
};

export type BlizzwayStreakResponse = {
  streak: BlizzwayPathwayGamification["streak"];
};

export type BlizzwayStreakCheckInResponse = {
  streak: BlizzwayPathwayGamification["streak"] & { duplicate: boolean };
  quest: { key: string; duplicate: boolean } | null;
  gamification: BlizzwayPathwayGamification;
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
  marketplaceCategory?: string;
  type: string | null;
  creditPrice: number;
  creditCost?: number;
  pricingMode?: string;
  description: string;
  shortDescription?: string;
  longDescription?: string;
  icon: string;
  status: string;
  isPrebuilt: boolean;
  isRequestable: boolean;
  canAddToGrowthBoard: boolean;
  isTrending?: boolean;
  active?: boolean;
  activation?: {
    id: string;
    status: string;
    attachedTo: string;
    activatedAt: string;
  } | null;
  capabilities?: string[];
  expectedOutput?: string[];
  recommendedFor?: string[];
  requiredInputs?: string[];
  chargeOn?: string;
  nexaRecommendation?: string;
  safetyNote?: string;
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
  trending?: BlizzwayAgent[];
  active?: BlizzwayAgent[];
  categories?: string[];
};

export type CompanionDetailResponse = { companion: BlizzwayAgent };
export type CompanionActivationResponse = {
  activation: { id: string; status: string; attachedTo: string; activatedAt: string; duplicate: boolean };
  companion: BlizzwayAgent;
  ledger: { id: string; amount: number; balanceAfter: number; description: string } | null;
};
export type ActiveCompanionsResponse = {
  companions: Array<{ id: string; attachedTo: string; status: string; activatedAt: string; companion: BlizzwayAgent }>;
  total: number;
  byAttachment: { pathway: number; learning: number; earning: number };
};

export type CompanionStructuredOutput = {
  title?: string;
  summary?: string;
  sections?: Array<{ heading?: string; content?: string; bullets?: string[] }>;
  actionSteps?: string[];
  warnings?: string[];
  recommendedNextActions?: string[];
  bdpImpact?: string;
  pathwayImpact?: string;
  nexaNote?: string;
  missingInputs?: string[];
  expectedOutput?: string[];
  safetyNote?: string;
  nextActions?: string[];
  checklist?: string[];
  provider?: string;
  model?: string;
  promptTemplateKey?: string;
  generatedAt?: string;
  outputVersion?: string;
  fallbackUsed?: boolean;
  [key: string]: unknown;
};

export type CompanionRunResponse = {
  run: {
    id: string;
    status: string;
    input: unknown;
    output: CompanionStructuredOutput;
    creditsCharged: number;
    createdAt: string;
    duplicate: boolean;
  };
};
export type CustomCompanionRequestResponse = {
  request: {
    id: string;
    title: string;
    category: string;
    description: string;
    expectedOutput: string | null;
    status: string;
    createdAt: string;
  };
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

export type BlizzwayCreditPackage = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceInr: number;
  baseCredits: number;
  bonusCredits: number;
  totalCredits: number;
  badgeLabel: string | null;
  active: boolean;
  sortOrder: number;
};

export type BlizzwaySubscriptionPlan = {
  id: string;
  slug: string;
  name: string;
  monthlyPriceInr: number;
  monthlyCredits: number;
  features: string[];
  active: boolean;
  sortOrder: number;
};

export type BlizzwayInvoicePlaceholder = {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
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
  creditPackages: BlizzwayCreditPackage[];
  subscriptionPlans: BlizzwaySubscriptionPlan[];
  invoices: BlizzwayInvoicePlaceholder[];
};

export type BlizzwayWalletTopUpRequest = {
  gateway?: string;
  packageId?: string;
  packageSlug?: string;
  idempotencyKey?: string;
};

export type BlizzwayWalletTopUpResponse = {
  payment: unknown;
  checkout: unknown;
  package: BlizzwayCreditPackage;
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
  recommendations?: BlizzwayNexaRecommendationsV1 | BlizzwayNexaRecommendation[];
};

export type BlizzwayOnboardingInput = {
  currentStatus: string;
  dreamGoal: string;
  preferredLocation?: string;
  educationLevel?: string;
  skills: string[];
  interests: string[];
  confidenceLevel?: string;
  communicationLevel?: string;
  financialReadiness?: string;
  timeline?: string;
  languageGoals: string[];
  admissionsGoals: string[];
  earningGoals: string[];
  answers: Record<string, string>;
  completed?: boolean;
};

export type BlizzwayNexaRecommendationsV1 = {
  onboardingComplete: boolean;
  greeting: string;
  firstAssessments: BlizzwayAssessment[];
  bdpSteps: string[];
  pathwayMilestones: Array<{
    id: string;
    title: string;
    status: string;
    xp: number;
    progress: number;
    description: string;
  }>;
  learningSuggestions: string[];
  earningSuggestions: string[];
  admissionsSuggestions: string[];
  quickBoosts: QuickBoost[];
  companionSuggestions: string[];
  safetyNote: string;
};

export type BlizzwayOnboardingResponse = {
  onboarding: unknown;
  bdp?: unknown;
  pathway?: unknown;
  status?: string;
  recommendations: BlizzwayNexaRecommendationsV1;
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
