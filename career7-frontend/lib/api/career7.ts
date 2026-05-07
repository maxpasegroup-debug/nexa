import { api } from "./client";
import type {
  BgosSessionResponse,
  Career7AgentsResponse,
  Career7GrowthBoardResponse,
  Career7HealthResponse,
  Career7MetricsResponse,
  Career7NexaRequest,
  Career7NexaResponse,
  Career7UserProfile,
  Career7WalletResponse,
  Career7WalletTopUpRequest,
  Career7WalletTopUpResponse,
} from "./types";

export type Career7AgentFilters = {
  category?: string;
  type?: string;
  status?: string;
  growthBoardOnly?: boolean;
};

export type AddGrowthBoardAgentRequest = {
  agentId: string;
  path: "learning" | "earning";
};

export type UpdateGrowthBoardAgentRequest = {
  id: string;
  active: boolean;
};

export const career7Api = {
  getProfile: () => api.get<Career7UserProfile>("/api/career7/profile"),

  getSession: () => api.get<BgosSessionResponse>("/api/auth/session"),

  getHealth: () => api.get<Career7HealthResponse>("/api/career7/health"),

  getMetrics: () => api.get<Career7MetricsResponse>("/api/career7/metrics"),

  getGrowthBoard: () => api.get<Career7GrowthBoardResponse>("/api/career7/growth-board"),

  addGrowthBoardAgent: (body: AddGrowthBoardAgentRequest) =>
    api.post<{ item: Career7GrowthBoardResponse["board"]["learning"][number] }>(
      "/api/career7/growth-board",
      body,
    ),

  updateGrowthBoardAgent: (body: UpdateGrowthBoardAgentRequest) =>
    api.patch<{ item: Career7GrowthBoardResponse["board"]["learning"][number] }>(
      "/api/career7/growth-board",
      body,
    ),

  getMarketplaceAgents: (filters: Career7AgentFilters = {}) =>
    api.get<Career7AgentsResponse>("/api/career7/agents", { query: filters }),

  getWallet: () => api.get<Career7WalletResponse>("/api/career7/wallet"),

  topUpWallet: (body: Career7WalletTopUpRequest) =>
    api.post<Career7WalletTopUpResponse>("/api/career7/wallet", body),

  askNexa: (body: Career7NexaRequest) =>
    api.post<Career7NexaResponse>("/api/career7/nexa", body),
};
