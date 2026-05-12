import { api } from "./client";
import type {
  BlizzwayAssessmentAnswerResponse,
  BlizzwayAssessmentDetailResponse,
  BlizzwayAssessmentRecommendationsResponse,
  BlizzwayAssessmentResultsResponse,
  BlizzwayAssessmentStartResponse,
  BlizzwayAssessmentSubmitResponse,
  BlizzwayAssessmentsResponse,
} from "./types";

const ASSESSMENTS_PATH = "/api/career7/assessments";

export const assessmentsApi = {
  getAssessments: () => api.get<BlizzwayAssessmentsResponse>(ASSESSMENTS_PATH),
  safeGetAssessments: () => api.safeGet<BlizzwayAssessmentsResponse>(ASSESSMENTS_PATH),
  getAssessment: (slug: string) => api.get<BlizzwayAssessmentDetailResponse>(`${ASSESSMENTS_PATH}/${slug}`),
  startAssessment: (slug: string, idempotencyKey: string) =>
    api.post<BlizzwayAssessmentStartResponse>(`${ASSESSMENTS_PATH}/${slug}/start`, { idempotencyKey }),
  saveAnswer: (attemptId: string, questionId: string, value: unknown) =>
    api.post<BlizzwayAssessmentAnswerResponse>(`${ASSESSMENTS_PATH}/attempts/${attemptId}/answer`, { questionId, value }),
  submitAttempt: (attemptId: string) =>
    api.post<BlizzwayAssessmentSubmitResponse>(`${ASSESSMENTS_PATH}/attempts/${attemptId}/submit`),
  getResults: () => api.get<BlizzwayAssessmentResultsResponse>(`${ASSESSMENTS_PATH}/results`),
  getResult: (resultId: string) => api.get<{ result: BlizzwayAssessmentSubmitResponse["result"] }>(`${ASSESSMENTS_PATH}/results/${resultId}`),
  getRecommendations: () => api.get<BlizzwayAssessmentRecommendationsResponse>(`${ASSESSMENTS_PATH}/recommendations`),
};
