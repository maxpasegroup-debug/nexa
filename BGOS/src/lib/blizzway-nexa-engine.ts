import type { Prisma } from "@prisma/client";

import type { Career7Context } from "@/lib/career7-auth";
import { BLIZZWAY_BUSINESS_MODEL } from "@/lib/career7-wallet";
import { starterAssessments, quickBoosts, starterAdmissions } from "@/lib/career7-data";
import { prisma } from "@/lib/prisma";

const allowedStatuses = new Set([
  "school_student",
  "college_student",
  "graduate",
  "working_professional",
  "career_switcher",
  "study_abroad_aspirant",
  "migration_aspirant",
  "freelancer",
  "entrepreneur",
]);

const allowedTimelines = new Set(["6_months", "1_year", "3_years", "5_years"]);

export type BlizzwayOnboardingInput = {
  currentStatus?: string;
  dreamGoal?: string;
  preferredLocation?: string;
  educationLevel?: string;
  skills?: string[];
  interests?: string[];
  confidenceLevel?: string;
  communicationLevel?: string;
  financialReadiness?: string;
  timeline?: string;
  languageGoals?: string[];
  admissionsGoals?: string[];
  earningGoals?: string[];
  answers?: Record<string, string>;
  completed?: boolean;
};

function cleanText(value: unknown, fallback = "") {
  return String(value ?? fallback).trim().slice(0, 600);
}

function cleanList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => cleanText(item).slice(0, 80)).filter(Boolean).slice(0, 12);
}

function cleanRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => [cleanText(key).slice(0, 60), cleanText(item)])
      .filter(([key, item]) => key && item),
  );
}

export function sanitizeBlizzwayOnboardingInput(input: BlizzwayOnboardingInput) {
  const currentStatus = cleanText(input.currentStatus, "graduate").toLowerCase();
  const timeline = cleanText(input.timeline, "1_year").toLowerCase();

  return {
    currentStatus: allowedStatuses.has(currentStatus) ? currentStatus : "graduate",
    dreamGoal: cleanText(input.dreamGoal, "Build a clear and confident career pathway"),
    preferredLocation: cleanText(input.preferredLocation),
    educationLevel: cleanText(input.educationLevel),
    skills: cleanList(input.skills),
    interests: cleanList(input.interests),
    confidenceLevel: cleanText(input.confidenceLevel),
    communicationLevel: cleanText(input.communicationLevel),
    financialReadiness: cleanText(input.financialReadiness),
    timeline: allowedTimelines.has(timeline) ? timeline : "1_year",
    languageGoals: cleanList(input.languageGoals),
    admissionsGoals: cleanList(input.admissionsGoals),
    earningGoals: cleanList(input.earningGoals),
    answers: cleanRecord(input.answers),
    completed: Boolean(input.completed),
  };
}

function titleCase(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function hasGlobalIntent(profile: Awaited<ReturnType<typeof getBlizzwayOnboardingProfile>>) {
  if (!profile) return false;
  const status = profile.currentStatus;
  const location = (profile.preferredLocation ?? "").toLowerCase();
  return (
    status.includes("abroad") ||
    status.includes("migration") ||
    location.includes("canada") ||
    location.includes("uk") ||
    location.includes("australia") ||
    location.includes("germany")
  );
}

function arrayFromJson(value: Prisma.JsonValue | null | undefined) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export async function getBlizzwayOnboardingProfile(context: Career7Context) {
  return prisma.blizzwayOnboardingProfile.findUnique({
    where: {
      businessModel_businessId_userId: {
        businessModel: BLIZZWAY_BUSINESS_MODEL,
        businessId: context.businessId,
        userId: context.userId,
      },
    },
  });
}

export async function saveBlizzwayOnboardingProfile(
  context: Career7Context,
  input: BlizzwayOnboardingInput,
) {
  const data = sanitizeBlizzwayOnboardingInput(input);
  const completionStatus = data.completed ? "COMPLETED" : "IN_PROGRESS";
  const completedAt = data.completed ? new Date() : null;

  return prisma.blizzwayOnboardingProfile.upsert({
    where: {
      businessModel_businessId_userId: {
        businessModel: BLIZZWAY_BUSINESS_MODEL,
        businessId: context.businessId,
        userId: context.userId,
      },
    },
    create: {
      businessModel: BLIZZWAY_BUSINESS_MODEL,
      businessId: context.businessId,
      userId: context.userId,
      currentStatus: data.currentStatus,
      dreamGoal: data.dreamGoal,
      preferredLocation: data.preferredLocation,
      educationLevel: data.educationLevel,
      skills: data.skills as Prisma.InputJsonValue,
      interests: data.interests as Prisma.InputJsonValue,
      confidenceLevel: data.confidenceLevel,
      communicationLevel: data.communicationLevel,
      financialReadiness: data.financialReadiness,
      timeline: data.timeline,
      languageGoals: data.languageGoals as Prisma.InputJsonValue,
      admissionsGoals: data.admissionsGoals as Prisma.InputJsonValue,
      earningGoals: data.earningGoals as Prisma.InputJsonValue,
      answers: data.answers as Prisma.InputJsonValue,
      completionStatus,
      completedAt,
    },
    update: {
      currentStatus: data.currentStatus,
      dreamGoal: data.dreamGoal,
      preferredLocation: data.preferredLocation,
      educationLevel: data.educationLevel,
      skills: data.skills as Prisma.InputJsonValue,
      interests: data.interests as Prisma.InputJsonValue,
      confidenceLevel: data.confidenceLevel,
      communicationLevel: data.communicationLevel,
      financialReadiness: data.financialReadiness,
      timeline: data.timeline,
      languageGoals: data.languageGoals as Prisma.InputJsonValue,
      admissionsGoals: data.admissionsGoals as Prisma.InputJsonValue,
      earningGoals: data.earningGoals as Prisma.InputJsonValue,
      answers: data.answers as Prisma.InputJsonValue,
      completionStatus,
      completedAt,
    },
  });
}

export async function buildNexaRecommendations(context: Career7Context) {
  const profile = await getBlizzwayOnboardingProfile(context);
  const globalIntent = hasGlobalIntent(profile);
  const earningGoals = arrayFromJson(profile?.earningGoals);
  const languageGoals = arrayFromJson(profile?.languageGoals);
  const interests = arrayFromJson(profile?.interests);
  const recommendedAssessments = starterAssessments.filter((assessment) =>
    assessment.slug === "career-compass-starter" ||
    assessment.slug === "academic-readiness-check" ||
    (globalIntent && assessment.slug === "global-readiness-scan") ||
    (languageGoals.length > 0 && assessment.slug === "communication-spark"),
  );

  return {
    onboardingComplete: profile?.completionStatus === "COMPLETED",
    greeting: profile
      ? `Welcome back. I am shaping your Blizzway around ${profile.dreamGoal}.`
      : "Welcome. I can build your first Blizzway pathway once onboarding is complete.",
    firstAssessments: recommendedAssessments.slice(0, 3),
    bdpSteps: [
      "Add your current stage, strengths, and dream goal to your BDP.",
      "Complete Career Compass Starter to sharpen direction.",
      globalIntent
        ? "Complete Global Readiness Scan before relying on international pathway suggestions."
        : "Add proof stories so NEXA can make your recommendations more specific.",
    ],
    pathwayMilestones: starterMilestones(profile),
    learningSuggestions: [
      languageGoals.length ? "Practice one language confidence drill for 15 minutes." : "Choose one skill sprint for this week.",
      interests[0] ? `Build a tiny proof project around ${interests[0]}.` : "Save one learning goal in your Soul Vault.",
    ],
    earningSuggestions: earningGoals.length
      ? earningGoals.map((goal) => `Turn ${goal} into one small portfolio or application action.`).slice(0, 3)
      : ["Explore one beginner-friendly project, internship, freelance, or job pathway."],
    admissionsSuggestions: globalIntent
      ? starterAdmissions.map((item) => item.nexaAdvice).slice(0, 2)
      : ["Use Academic Readiness Check before shortlisting courses or colleges."],
    quickBoosts: quickBoosts.slice(0, globalIntent ? 3 : 2),
    companionSuggestions: globalIntent
      ? ["Global Guide", "SOP Mentor", "Admissions Companion"]
      : ["Resume Architect", "Interview Coach", "Career Compass Companion"],
    safetyNote:
      "NEXA gives career and admissions preparation guidance only. It does not guarantee jobs, admissions, visas, scholarships, or migration outcomes.",
  };
}

export function starterMilestones(profile: Awaited<ReturnType<typeof getBlizzwayOnboardingProfile>>) {
  const goal = profile?.dreamGoal ?? "your dream goal";
  return [
    { id: "discover-yourself", title: "Discover Yourself", status: "active", xp: 50, progress: 20 },
    { id: "build-bdp", title: "Build Your BDP", status: "available", xp: 75, progress: 10 },
    { id: "first-assessments", title: "Complete First Assessments", status: "available", xp: 100, progress: 0 },
    { id: "learning-garden", title: "Start Learning Garden", status: "available", xp: 80, progress: 0 },
    { id: "explore-routes", title: "Explore Admissions/Earning", status: "locked", xp: 100, progress: 0 },
    { id: "first-achievement", title: "Unlock First Achievement", status: "locked", xp: 120, progress: 0 },
  ].map((item) => ({ ...item, description: `NEXA links this milestone to ${goal}.` }));
}

export async function generateStarterBdp(context: Career7Context) {
  const profile = await getBlizzwayOnboardingProfile(context);
  const recommendations = await buildNexaRecommendations(context);
  const status = profile?.currentStatus ?? "graduate";
  const strengths = [
    ...arrayFromJson(profile?.skills).slice(0, 3),
    ...arrayFromJson(profile?.interests).slice(0, 3),
  ].slice(0, 5);

  return prisma.blizzwayBdpProfile.upsert({
    where: {
      businessModel_businessId_userId: {
        businessModel: BLIZZWAY_BUSINESS_MODEL,
        businessId: context.businessId,
        userId: context.userId,
      },
    },
    create: {
      businessModel: BLIZZWAY_BUSINESS_MODEL,
      businessId: context.businessId,
      userId: context.userId,
      headline: `${titleCase(status)} building a Blizzway pathway`,
      currentStageSummary: profile
        ? `A ${titleCase(status).toLowerCase()} moving toward ${profile.dreamGoal}. NEXA is keeping the first plan practical, confidence-aware, and proof-focused.`
        : "A new Blizzway explorer ready to create a profile through onboarding.",
      strengths: (strengths.length ? strengths : ["Curiosity", "Growth intent", "Career courage"]) as Prisma.InputJsonValue,
      readiness: {
        confidenceLevel: profile?.confidenceLevel ?? "starter",
        communicationLevel: profile?.communicationLevel ?? "starter",
        financialReadiness: profile?.financialReadiness ?? "starter",
        timeline: profile?.timeline ?? "1_year",
      } as Prisma.InputJsonValue,
      recommendedActions: recommendations.bdpSteps as Prisma.InputJsonValue,
      profileStrength: profile?.completionStatus === "COMPLETED" ? 55 : 35,
    },
    update: {
      headline: `${titleCase(status)} building a Blizzway pathway`,
      currentStageSummary: profile
        ? `A ${titleCase(status).toLowerCase()} moving toward ${profile.dreamGoal}. NEXA is keeping the first plan practical, confidence-aware, and proof-focused.`
        : "A new Blizzway explorer ready to create a profile through onboarding.",
      strengths: (strengths.length ? strengths : ["Curiosity", "Growth intent", "Career courage"]) as Prisma.InputJsonValue,
      readiness: {
        confidenceLevel: profile?.confidenceLevel ?? "starter",
        communicationLevel: profile?.communicationLevel ?? "starter",
        financialReadiness: profile?.financialReadiness ?? "starter",
        timeline: profile?.timeline ?? "1_year",
      } as Prisma.InputJsonValue,
      recommendedActions: recommendations.bdpSteps as Prisma.InputJsonValue,
      profileStrength: profile?.completionStatus === "COMPLETED" ? 55 : 35,
    },
  });
}

export async function generateStarterPathway(context: Career7Context) {
  const profile = await getBlizzwayOnboardingProfile(context);
  const milestones = starterMilestones(profile);

  return prisma.blizzwayStarterPathway.upsert({
    where: {
      businessModel_businessId_userId: {
        businessModel: BLIZZWAY_BUSINESS_MODEL,
        businessId: context.businessId,
        userId: context.userId,
      },
    },
    create: {
      businessModel: BLIZZWAY_BUSINESS_MODEL,
      businessId: context.businessId,
      userId: context.userId,
      title: profile ? `${profile.dreamGoal} Starter Pathway` : "Starter Blizzway Pathway",
      milestones: milestones as Prisma.InputJsonValue,
      xp: 0,
      level: 1,
      progress: profile?.completionStatus === "COMPLETED" ? 15 : 10,
      achievementHooks: ["first_assessment", "publish_bdp", "pathway_milestone"] as Prisma.InputJsonValue,
    },
    update: {
      title: profile ? `${profile.dreamGoal} Starter Pathway` : "Starter Blizzway Pathway",
      milestones: milestones as Prisma.InputJsonValue,
      progress: profile?.completionStatus === "COMPLETED" ? 15 : 10,
      achievementHooks: ["first_assessment", "publish_bdp", "pathway_milestone"] as Prisma.InputJsonValue,
    },
  });
}

export async function getNexaChatReply(context: Career7Context, message: string, quickAction?: string) {
  const recommendations = await buildNexaRecommendations(context);
  const normalized = (quickAction || message).toLowerCase();

  let reply = recommendations.greeting;
  if (normalized.includes("today")) {
    reply = `Today I would do three small things: ${recommendations.bdpSteps[0]} Then take ${recommendations.firstAssessments[0]?.title ?? "Career Compass Starter"}, and save one proof note.`;
  } else if (normalized.includes("bdp")) {
    reply = `Your BDP will improve fastest if you add proof, complete one starter assessment, and keep your headline honest. ${recommendations.bdpSteps[1]}`;
  } else if (normalized.includes("assessment")) {
    reply = `Start with ${recommendations.firstAssessments.map((item) => item.title).join(", ")}. These are preparation tools, not labels or final judgments.`;
  } else if (normalized.includes("pathway")) {
    reply = `I can build a starter pathway with Discover Yourself, Build Your BDP, First Assessments, Learning Garden, route exploration, and a first achievement.`;
  } else if (normalized.includes("learning")) {
    reply = recommendations.learningSuggestions.join(" ");
  } else if (normalized.includes("earning")) {
    reply = recommendations.earningSuggestions.join(" ");
  } else if (normalized.includes("admission")) {
    reply = `${recommendations.admissionsSuggestions.join(" ")} This is preparation guidance only, not an admissions or visa guarantee.`;
  }

  return {
    message: reply,
    chips: [
      "What should I do today?",
      "Improve my BDP",
      "Recommend assessments",
      "Build my pathway",
      "Find learning options",
      "Find earning options",
      "Guide admissions",
    ],
    recommendations,
  };
}
