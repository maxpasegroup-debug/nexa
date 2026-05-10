import { api } from "./client";
import type { LearningGardenResponse } from "./types";

// Legacy BGOS compatibility: Blizzway endpoints are still exposed under /api/career7/*.
const LEARNING_GARDEN_PATH = "/api/career7/learning-garden";

export const learningGardenApi = {
  getLearningGarden: () => api.get<LearningGardenResponse>(LEARNING_GARDEN_PATH),
  safeGetLearningGarden: () => api.safeGet<LearningGardenResponse>(LEARNING_GARDEN_PATH),
};
