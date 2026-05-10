import { api } from "./client";
import type { Career7AgentsResponse } from "./types";

export type MagicMarketFilters = {
  category?: string;
  type?: string;
  status?: string;
  growthBoardOnly?: boolean;
};

const MAGIC_MARKET_PATH = "/api/career7/agents";

export const magicMarketApi = {
  getMagicMarket: (filters: MagicMarketFilters = {}) =>
    api.get<Career7AgentsResponse>(MAGIC_MARKET_PATH, { query: filters }),
  safeGetMagicMarket: (filters: MagicMarketFilters = {}) =>
    api.safeGet<Career7AgentsResponse>(MAGIC_MARKET_PATH, { query: filters }),
};
