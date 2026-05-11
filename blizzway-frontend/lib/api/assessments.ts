import { api } from "./client";
import type { BlizzwayAssessmentsResponse } from "./types";

const ASSESSMENTS_PATH = "/api/career7/assessments";

export const assessmentsApi = {
  getAssessments: () => api.get<BlizzwayAssessmentsResponse>(ASSESSMENTS_PATH),
  safeGetAssessments: () => api.safeGet<BlizzwayAssessmentsResponse>(ASSESSMENTS_PATH),
};
