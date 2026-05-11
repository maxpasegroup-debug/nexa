import { api } from "./client";
import type {
  BlizzwayBdpResponse,
  BlizzwayPublicBdpSettingsResponse,
  BlizzwayPublishedBdpResponse,
} from "./types";

const BDP_PATH = "/api/career7/bdp";

export const bdpApi = {
  getBdp: () => api.get<BlizzwayBdpResponse>(BDP_PATH),
  safeGetBdp: () => api.safeGet<BlizzwayBdpResponse>(BDP_PATH),
  generateBdp: () => api.post<BlizzwayBdpResponse>(`${BDP_PATH}/generate`),
  getPublicSettings: () => api.get<BlizzwayPublicBdpSettingsResponse>(`${BDP_PATH}/public-settings`),
  updatePublicSettings: (body: Record<string, unknown>) =>
    api.patch<BlizzwayPublicBdpSettingsResponse>(`${BDP_PATH}/public-settings`, body),
  publishPublicProfile: () =>
    api.post<BlizzwayPublicBdpSettingsResponse>(`${BDP_PATH}/publish`),
  getPublicProfile: (slug: string) =>
    api.get<BlizzwayPublishedBdpResponse>(`${BDP_PATH}/public/${slug}`, { authToken: null }),
  trackPublicView: (slug: string) =>
    api.post<{ ok: boolean; viewCount: number }>(`${BDP_PATH}/public/${slug}/view`, undefined, { authToken: null }),
};
