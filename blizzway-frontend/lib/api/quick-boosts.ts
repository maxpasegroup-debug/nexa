import { api } from "./client";
import type { QuickBoostsResponse } from "./types";

// Legacy BGOS compatibility: Blizzway endpoints are still exposed under /api/career7/*.
const QUICK_BOOSTS_PATH = "/api/career7/quick-boosts";

export const quickBoostsApi = {
  getQuickBoosts: () => api.get<QuickBoostsResponse>(QUICK_BOOSTS_PATH),
  safeGetQuickBoosts: () => api.safeGet<QuickBoostsResponse>(QUICK_BOOSTS_PATH),
};
