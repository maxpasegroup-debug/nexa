import { api } from "./client";
import type { BlizzwayBdpResponse } from "./types";

const BDP_PATH = "/api/career7/bdp";

export const bdpApi = {
  getBdp: () => api.get<BlizzwayBdpResponse>(BDP_PATH),
  safeGetBdp: () => api.safeGet<BlizzwayBdpResponse>(BDP_PATH),
  generateBdp: () => api.post<BlizzwayBdpResponse>(`${BDP_PATH}/generate`),
};
