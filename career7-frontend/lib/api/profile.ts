import { api } from "./client";
import type { Career7UserProfile } from "./types";

const PROFILE_PATH = "/api/career7/profile";

export const profileApi = {
  getProfile: () => api.get<Career7UserProfile>(PROFILE_PATH),
  safeGetProfile: () => api.safeGet<Career7UserProfile>(PROFILE_PATH),
};
