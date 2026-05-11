import { api } from "./client";
import type { BlizzwayOnboardingInput, BlizzwayOnboardingResponse } from "./types";

const ONBOARDING_PATH = "/api/career7/onboarding";

export const onboardingApi = {
  getOnboarding: () => api.get<BlizzwayOnboardingResponse>(ONBOARDING_PATH),
  saveOnboarding: (body: BlizzwayOnboardingInput) =>
    api.post<BlizzwayOnboardingResponse>(ONBOARDING_PATH, body),
};
