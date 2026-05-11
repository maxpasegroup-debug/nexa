import { api } from "./client";
import type { BlizzwayNexaRequest, BlizzwayNexaResponse, BlizzwayOnboardingResponse } from "./types";

// Legacy BGOS compatibility: Blizzway endpoints are still exposed under /api/career7/*.
const NEXA_PATH = "/api/career7/nexa";

export const nexaApi = {
  askNexa: (body: BlizzwayNexaRequest) => api.post<BlizzwayNexaResponse>(NEXA_PATH, body),
  chat: (body: BlizzwayNexaRequest) => api.post<BlizzwayNexaResponse>(`${NEXA_PATH}/chat`, body),
  getRecommendations: () =>
    api.get<Pick<BlizzwayOnboardingResponse, "recommendations">>(`${NEXA_PATH}/recommendations`),
  generateStarterPathway: () => api.post<{ pathway: unknown }>(`${NEXA_PATH}/generate-starter-pathway`),
  safeAskNexa: (body: BlizzwayNexaRequest) =>
    api.safePost<BlizzwayNexaResponse>(NEXA_PATH, body),
};
