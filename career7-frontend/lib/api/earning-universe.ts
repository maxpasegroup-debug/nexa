import { api } from "./client";
import type { EarningUniverseResponse } from "./types";

const EARNING_UNIVERSE_PATH = "/api/career7/earning-universe";

export const earningUniverseApi = {
  getEarningUniverse: () => api.get<EarningUniverseResponse>(EARNING_UNIVERSE_PATH),
  safeGetEarningUniverse: () => api.safeGet<EarningUniverseResponse>(EARNING_UNIVERSE_PATH),
};
