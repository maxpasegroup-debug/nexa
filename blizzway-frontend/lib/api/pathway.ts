import { api } from "./client";
import type {
  BlizzwayAchievementClaimResponse,
  BlizzwayAchievementsResponse,
  BlizzwayPathwayGamificationResponse,
  BlizzwayPathwayResponse,
  BlizzwayQuestCompleteResponse,
  BlizzwayStreakCheckInResponse,
  BlizzwayStreakResponse,
} from "./types";

// Legacy BGOS compatibility: Blizzway endpoints are still exposed under /api/career7/*.
const PATHWAY_PATH = "/api/career7/pathway";

export const pathwayApi = {
  getPathway: () => api.get<BlizzwayPathwayResponse>(PATHWAY_PATH),
  safeGetPathway: () => api.safeGet<BlizzwayPathwayResponse>(PATHWAY_PATH),
  getGamification: () =>
    api.get<BlizzwayPathwayGamificationResponse>(`${PATHWAY_PATH}/gamification`),
  completeQuest: (questKey: string, body: Record<string, unknown> = {}) =>
    api.post<BlizzwayQuestCompleteResponse>(`${PATHWAY_PATH}/quests/${questKey}/complete`, body),
  getAchievements: () =>
    api.get<BlizzwayAchievementsResponse>(`${PATHWAY_PATH}/achievements`),
  claimAchievement: (achievementKey: string) =>
    api.post<BlizzwayAchievementClaimResponse>(`${PATHWAY_PATH}/achievements/${achievementKey}/claim`),
  getStreak: () =>
    api.get<BlizzwayStreakResponse>(`${PATHWAY_PATH}/streaks`),
  checkInStreak: () =>
    api.post<BlizzwayStreakCheckInResponse>(`${PATHWAY_PATH}/streaks/check-in`),
};
