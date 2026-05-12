import { api } from "./client";
import type { BlizzwayNexaConversation, BlizzwayNexaConversationSummary, BlizzwayNexaRequest, BlizzwayNexaResponse, BlizzwayOnboardingResponse } from "./types";

// Legacy BGOS compatibility: Blizzway endpoints are still exposed under /api/career7/*.
const NEXA_PATH = "/api/career7/nexa";

export const nexaApi = {
  askNexa: (body: BlizzwayNexaRequest) => api.post<BlizzwayNexaResponse>(NEXA_PATH, body),
  chat: (body: BlizzwayNexaRequest) => api.post<BlizzwayNexaResponse>(`${NEXA_PATH}/chat`, body),
  getRecommendations: () =>
    api.get<Pick<BlizzwayOnboardingResponse, "recommendations">>(`${NEXA_PATH}/recommendations`),
  generateStarterPathway: () => api.post<{ pathway: unknown }>(`${NEXA_PATH}/generate-starter-pathway`),
  getConversations: () => api.get<{ conversations: BlizzwayNexaConversationSummary[] }>(`${NEXA_PATH}/conversations`),
  getConversation: (id: string) => api.get<{ conversation: BlizzwayNexaConversation }>(`${NEXA_PATH}/conversations/${id}`),
  dailyPlan: () => api.post<BlizzwayNexaResponse>(`${NEXA_PATH}/daily-plan`),
  recommendNextActions: () => api.post<BlizzwayNexaResponse>(`${NEXA_PATH}/recommend-next-actions`),
  refreshContext: () => api.post<{ ok: boolean; contextSummary: Record<string, unknown> }>(`${NEXA_PATH}/refresh-context`),
  safeAskNexa: (body: BlizzwayNexaRequest) =>
    api.safePost<BlizzwayNexaResponse>(NEXA_PATH, body),
};
