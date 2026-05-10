import { api } from "./client";
import type { LearningGardenResponse } from "./types";

const LEARNING_GARDEN_PATH = "/api/career7/learning-garden";

export const learningGardenApi = {
  getLearningGarden: () => api.get<LearningGardenResponse>(LEARNING_GARDEN_PATH),
  safeGetLearningGarden: () => api.safeGet<LearningGardenResponse>(LEARNING_GARDEN_PATH),
};
