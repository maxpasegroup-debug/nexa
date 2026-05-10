import { magicMarketApi, type MagicMarketFilters } from "./magic-market";
import { nexaApi } from "./nexa";
import { profileApi } from "./profile";
import { sessionApi } from "./session";
import { walletApi } from "./wallet";
import { api } from "./client";
import type {
  BlizzwayAgentsResponse,
  BlizzwayGrowthBoardResponse,
  BlizzwayHealthResponse,
  BlizzwayMetricsResponse,
} from "./types";

export type BlizzwayAgentFilters = MagicMarketFilters;

export type AddGrowthBoardAgentRequest = {
  agentId: string;
  path: "learning" | "earning";
};

export type UpdateGrowthBoardAgentRequest = {
  id: string;
  active: boolean;
};

// BGOS still exposes Blizzway data through legacy /api/career7/* routes.
// Keep these paths until BGOS ships a native /api/blizzway/* compatibility layer.
export const BlizzwayApi = {
  getProfile: profileApi.getProfile,

  getSession: sessionApi.getSession,

  getHealth: () => api.get<BlizzwayHealthResponse>("/api/career7/health"),

  getMetrics: () => api.get<BlizzwayMetricsResponse>("/api/career7/metrics"),

  getGrowthBoard: () => api.get<BlizzwayGrowthBoardResponse>("/api/career7/growth-board"),

  addGrowthBoardAgent: (body: AddGrowthBoardAgentRequest) =>
    api.post<{ item: BlizzwayGrowthBoardResponse["board"]["learning"][number] }>(
      "/api/career7/growth-board",
      body,
    ),

  updateGrowthBoardAgent: (body: UpdateGrowthBoardAgentRequest) =>
    api.patch<{ item: BlizzwayGrowthBoardResponse["board"]["learning"][number] }>(
      "/api/career7/growth-board",
      body,
    ),

  getMarketplaceAgents: (filters: BlizzwayAgentFilters = {}) =>
    magicMarketApi.getMagicMarket(filters) as Promise<BlizzwayAgentsResponse>,

  getWallet: walletApi.getWallet,

  topUpWallet: walletApi.topUpWallet,

  askNexa: nexaApi.askNexa,
};
