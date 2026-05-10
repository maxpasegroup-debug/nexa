export type ApiResponse<T> = T;

export type BlizzwayBusinessModel = "career7";

export type ISODateString = string;

export type Career7UserProfile = {
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

export type Career7MetricsResponse = {
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

export type Career7HealthResponse = {
  status: "healthy";
  module: "career7";
  timestamp: string;
};

export type Career7Agent = {
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

export type Career7AgentsResponse = {
  agents: Career7Agent[];
  total: number;
  featured: Career7Agent | null;
};

export type MagicMarketResponse = Career7AgentsResponse;

export type CompanionsResponse = {
  companions: Career7Agent[];
  total: number;
  featured: Career7Agent | null;
};

export type QuickBoost = {
  id: string;
  title: string;
  description: string;
  creditPrice: number;
  status: "available" | "coming_soon" | "archived";
};

export type QuickBoostsResponse = {
  boosts: QuickBoost[];
  total: number;
};

export type Career7GrowthBoardItem = {
  id: string;
  path: "learning" | "earning";
  status: string;
  addedAt: string;
  deactivatedAt: string | null;
  agent: Career7Agent;
};

export type Career7GrowthBoardResponse = {
  board: {
    learning: Career7GrowthBoardItem[];
    earning: Career7GrowthBoardItem[];
    inactive: Career7GrowthBoardItem[];
  };
  activeCounts: {
    learning: number;
    earning: number;
    total: number;
  };
  marketplaceAgents: Career7Agent[];
  wallet: Career7CreditWallet;
  paymentModeEnabled: boolean;
  nexaRecommendation: string;
};

export type Career7CreditWallet = {
  id: string;
  businessId: string;
  userId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
};

export type Career7WalletTransaction = {
  id: string;
  type: "Earned" | "Spent";
  amount: number;
  description: string;
  businessModel: "career7" | string;
  date: string;
};

export type Career7WalletResponse = {
  wallet: {
    primaryBalance: number;
    credits: number;
    recentTransactions: Career7WalletTransaction[];
  };
  payment: {
    enabledGateways: string[];
    defaultGateway: string;
    currency: string;
  };
};

export type Career7WalletTopUpRequest = {
  gateway?: string;
  amount?: number;
  credits?: number;
};

export type Career7WalletTopUpResponse = {
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

export type SoulVaultResponse = {
  vault: {
    certificates: number;
    achievements: number;
    tier: string;
    vaultItems: SoulVaultItem[];
  };
};

export type Career7NexaMessage = {
  role: "user" | "assistant";
  content: string;
};

export type Career7NexaRecommendation = {
  id: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  confidence?: number;
  source?: "placeholder" | "bgos";
};

export type Career7NexaRequest = {
  message?: string;
  quickAction?: string;
  history?: Career7NexaMessage[];
  conversationId?: string;
  memory?: Record<string, unknown>;
  recommendations?: Career7NexaRecommendation[];
};

export type Career7NexaResponse = {
  message: string;
  chips: string[];
  conversationId?: string;
  memory?: Record<string, unknown>;
  recommendations?: Career7NexaRecommendation[];
};
