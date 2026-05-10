import { api } from "./client";
import type { CompanionsResponse } from "./types";

export type CompanionFilters = {
  category?: string;
  type?: string;
  status?: string;
};

const COMPANIONS_PATH = "/api/career7/companions";

export const companionsApi = {
  getCompanions: (filters: CompanionFilters = {}) =>
    api.get<CompanionsResponse>(COMPANIONS_PATH, { query: filters }),
  safeGetCompanions: (filters: CompanionFilters = {}) =>
    api.safeGet<CompanionsResponse>(COMPANIONS_PATH, { query: filters }),
};
