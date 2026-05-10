import { api } from "./client";
import type { BlizzwayAgentsResponse } from "./types";

export type MagicMarketFilters = {
  category?: string;
  type?: string;
  status?: string;
  growthBoardOnly?: boolean;
};

// Legacy BGOS compatibility: Blizzway endpoints are still exposed under /api/career7/*.
const MAGIC_MARKET_PATH = "/api/career7/agents";

export const magicMarketApi = {
  getMagicMarket: (filters: MagicMarketFilters = {}) =>
    api.get<BlizzwayAgentsResponse>(MAGIC_MARKET_PATH, { query: filters }),
  safeGetMagicMarket: (filters: MagicMarketFilters = {}) =>
    api.safeGet<BlizzwayAgentsResponse>(MAGIC_MARKET_PATH, { query: filters }),
};
