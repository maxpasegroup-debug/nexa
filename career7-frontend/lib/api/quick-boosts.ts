import { api } from "./client";
import type { QuickBoostsResponse } from "./types";

const QUICK_BOOSTS_PATH = "/api/career7/quick-boosts";

export const quickBoostsApi = {
  getQuickBoosts: () => api.get<QuickBoostsResponse>(QUICK_BOOSTS_PATH),
  safeGetQuickBoosts: () => api.safeGet<QuickBoostsResponse>(QUICK_BOOSTS_PATH),
};
