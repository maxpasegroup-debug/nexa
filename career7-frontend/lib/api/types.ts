export type ApiResponse<T> = T;

export type Career7UserProfile = {
  id: string;
  name: string | null;
  email: string | null;
  role?: string | null;
  businessId?: string | null;
  businessModel: "career7";
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

export type Career7MetricsResponse = {
  metrics: {
    careerScore: number | null;
    walletBalance: number;
    credits: number;
    tasksCompleted: number;
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
