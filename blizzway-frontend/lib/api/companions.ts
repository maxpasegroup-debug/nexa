import { api } from "./client";
import type {
  ActiveCompanionsResponse,
  CompanionActivationResponse,
  CompanionDetailResponse,
  CompanionRunResponse,
  CompanionsResponse,
  CustomCompanionRequestResponse,
} from "./types";

export type CompanionFilters = {
  category?: string;
  type?: string;
  status?: string;
};

// Legacy BGOS compatibility: Blizzway endpoints are still exposed under /api/career7/*.
const COMPANIONS_PATH = "/api/career7/companions";

export const companionsApi = {
  getCompanions: (filters: CompanionFilters = {}) =>
    api.get<CompanionsResponse>(COMPANIONS_PATH, { query: filters }),
  safeGetCompanions: (filters: CompanionFilters = {}) =>
    api.safeGet<CompanionsResponse>(COMPANIONS_PATH, { query: filters }),
  getCompanion: (slug: string) =>
    api.get<CompanionDetailResponse>(`${COMPANIONS_PATH}/${slug}`),
  getActiveCompanions: () =>
    api.get<ActiveCompanionsResponse>(`${COMPANIONS_PATH}/active`),
  activateCompanion: (slug: string, idempotencyKey?: string) =>
    api.post<CompanionActivationResponse>(`${COMPANIONS_PATH}/${slug}/activate`, { idempotencyKey }),
  runCompanion: (slug: string, body: { inputs: Record<string, unknown>; idempotencyKey?: string }) =>
    api.post<CompanionRunResponse>(`${COMPANIONS_PATH}/${slug}/run`, body),
  requestCustomCompanion: (body: { title: string; category: string; description: string; expectedOutput?: string }) =>
    api.post<CustomCompanionRequestResponse>(`${COMPANIONS_PATH}/request-custom`, body),
};
