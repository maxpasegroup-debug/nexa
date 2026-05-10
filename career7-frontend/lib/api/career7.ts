import { magicMarketApi, type MagicMarketFilters } from "./magic-market";
import { nexaApi } from "./nexa";
import { profileApi } from "./profile";
import { sessionApi } from "./session";
import { walletApi } from "./wallet";
import { api } from "./client";
import type {
  Career7AgentsResponse,
  Career7GrowthBoardResponse,
  Career7HealthResponse,
  Career7MetricsResponse,
} from "./types";

export type Career7AgentFilters = MagicMarketFilters;

export type AddGrowthBoardAgentRequest = {
  agentId: string;
  path: "learning" | "earning";
};

export type UpdateGrowthBoardAgentRequest = {
  id: string;
  active: boolean;
};

export const career7Api = {
  getProfile: profileApi.getProfile,

  getSession: sessionApi.getSession,

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
    magicMarketApi.getMagicMarket(filters) as Promise<Career7AgentsResponse>,

  getWallet: walletApi.getWallet,

  topUpWallet: walletApi.topUpWallet,

  askNexa: nexaApi.askNexa,
};
