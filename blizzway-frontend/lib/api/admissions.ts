import { api } from "./client";
import type { BlizzwayAdmissionsResponse } from "./types";

const ADMISSIONS_PATH = "/api/career7/admissions";

export const admissionsApi = {
  getAdmissions: () => api.get<BlizzwayAdmissionsResponse>(ADMISSIONS_PATH),
  safeGetAdmissions: () => api.safeGet<BlizzwayAdmissionsResponse>(ADMISSIONS_PATH),
};
