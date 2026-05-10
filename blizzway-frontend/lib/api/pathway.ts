import { api } from "./client";
import type { BlizzwayPathwayResponse } from "./types";

// Legacy BGOS compatibility: Blizzway endpoints are still exposed under /api/career7/*.
const PATHWAY_PATH = "/api/career7/pathway";

export const pathwayApi = {
  getPathway: () => api.get<BlizzwayPathwayResponse>(PATHWAY_PATH),
  safeGetPathway: () => api.safeGet<BlizzwayPathwayResponse>(PATHWAY_PATH),
};
