import { api } from "./client";
import type { BlizzwayNexaRequest, BlizzwayNexaResponse } from "./types";

// Legacy BGOS compatibility: Blizzway endpoints are still exposed under /api/career7/*.
const NEXA_PATH = "/api/career7/nexa";

export const nexaApi = {
  askNexa: (body: BlizzwayNexaRequest) => api.post<BlizzwayNexaResponse>(NEXA_PATH, body),
  safeAskNexa: (body: BlizzwayNexaRequest) =>
    api.safePost<BlizzwayNexaResponse>(NEXA_PATH, body),
};
