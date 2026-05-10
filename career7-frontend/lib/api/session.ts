import { api } from "./client";
import type { AuthSessionResponse } from "./types";

const SESSION_PATH = "/api/auth/session";

export const sessionApi = {
  getSession: () => api.get<AuthSessionResponse>(SESSION_PATH),
  safeGetSession: () => api.safeGet<AuthSessionResponse>(SESSION_PATH),
};
