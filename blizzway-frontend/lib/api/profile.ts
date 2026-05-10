import { api } from "./client";
import type { BlizzwayUserProfile } from "./types";

// Legacy BGOS compatibility: Blizzway endpoints are still exposed under /api/career7/*.
const PROFILE_PATH = "/api/career7/profile";

export const profileApi = {
  getProfile: () => api.get<BlizzwayUserProfile>(PROFILE_PATH),
  safeGetProfile: () => api.safeGet<BlizzwayUserProfile>(PROFILE_PATH),
};
