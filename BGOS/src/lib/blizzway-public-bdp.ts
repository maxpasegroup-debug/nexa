import type { BlizzwayPublicBdpProfile, Prisma } from "@prisma/client";

import type { Career7Context } from "@/lib/career7-auth";
import { buildBdp } from "@/lib/career7-data";
import { prisma } from "@/lib/prisma";

const reservedSlugs = new Set([
  "admin",
  "api",
  "app",
  "bdp",
  "boss",
  "career7",
  "dashboard",
  "internal",
  "login",
  "logout",
  "magic-market",
  "onboarding",
  "p",
  "privacy",
  "settings",
  "signup",
  "soul-vault",
  "terms",
  "wallet",
  "www",
]);

const unsafeWords = ["admin", "support", "official", "blizzway", "career7"];

function cleanText(value: unknown, max = 800) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function asStringArray(value: unknown, max = 12) {
  return Array.isArray(value)
    ? value.map((item) => cleanText(item, 180)).filter(Boolean).slice(0, max)
    : [];
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9-_\s]/g, "").replace(/[\s_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export function validatePublicBdpSlug(value: unknown) {
  const slug = slugify(cleanText(value, 80));
  if (!slug) return { error: "Choose a public slug.", slug };
  if (slug.length < 3 || slug.length > 40) return { error: "Slug must be 3 to 40 characters.", slug };
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { error: "Use lowercase letters, numbers, and hyphens only.", slug };
  if (reservedSlugs.has(slug)) return { error: "That slug is reserved.", slug };
  if (unsafeWords.some((word) => slug === word || slug.startsWith(`${word}-`) || slug.endsWith(`-${word}`))) {
    return { error: "That slug is not available.", slug };
  }
  return { slug };
}

function publicUrl(slug: string) {
  return `https://blizzway.com/p/${slug}`;
}

async function defaultSlugForUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
  const base = slugify(user?.name || user?.email?.split("@")[0] || "blizzway-profile") || "blizzway-profile";
  const candidate = validatePublicBdpSlug(base);
  const fallback = `profile-${userId.slice(0, 8).toLowerCase()}`;
  const validBase = "slug" in candidate && !("error" in candidate) ? candidate.slug : fallback;

  for (let index = 0; index < 20; index += 1) {
    const publicSlug = index === 0 ? validBase : `${validBase}-${index + 1}`;
    const existing = await prisma.blizzwayPublicBdpProfile.findUnique({
      where: { publicSlug },
      select: { id: true },
    });

    if (!existing) return publicSlug;
  }

  return `${fallback}-${Date.now().toString(36)}`;
}

function serializeJsonArray(value: Prisma.JsonValue, max = 12) {
  return Array.isArray(value) ? value.slice(0, max) : [];
}

function jsonArrayInput(value: Prisma.JsonValue) {
  return serializeJsonArray(value) as Prisma.InputJsonArray;
}

export function serializePrivatePublicBdp(profile: BlizzwayPublicBdpProfile | null) {
  if (!profile) return null;
  return {
    id: profile.id,
    publicSlug: profile.publicSlug,
    publicUrl: publicUrl(profile.publicSlug),
    isPublic: profile.isPublic,
    headline: profile.headline,
    summary: profile.summary,
    location: profile.location,
    availability: profile.availability,
    careerGoals: serializeJsonArray(profile.careerGoals),
    skills: serializeJsonArray(profile.skills),
    languages: serializeJsonArray(profile.languages),
    education: serializeJsonArray(profile.education),
    experience: serializeJsonArray(profile.experience),
    projects: serializeJsonArray(profile.projects),
    achievements: serializeJsonArray(profile.achievements),
    assessmentHighlights: serializeJsonArray(profile.assessmentHighlights),
    pathwayHighlights: serializeJsonArray(profile.pathwayHighlights),
    companionHighlights: serializeJsonArray(profile.companionHighlights),
    documentHighlights: serializeJsonArray(profile.documentHighlights),
    contactVisibility: profile.contactVisibility,
    recruiterContactEmail: profile.contactVisibility === "email" ? profile.recruiterContactEmail : null,
    lastPublishedAt: profile.lastPublishedAt?.toISOString() ?? null,
    viewCount: profile.viewCount,
    privacySettings: profile.privacySettings,
    updatedAt: profile.updatedAt.toISOString(),
  };
}

export function serializePublicBdp(profile: BlizzwayPublicBdpProfile & { user: { name: string } }) {
  return {
    name: profile.user.name,
    publicSlug: profile.publicSlug,
    headline: profile.headline,
    summary: profile.summary,
    location: profile.location,
    availability: profile.availability,
    careerGoals: serializeJsonArray(profile.careerGoals),
    skills: serializeJsonArray(profile.skills),
    languages: serializeJsonArray(profile.languages),
    education: serializeJsonArray(profile.education),
    experience: serializeJsonArray(profile.experience),
    projects: serializeJsonArray(profile.projects),
    achievements: serializeJsonArray(profile.achievements),
    assessmentHighlights: serializeJsonArray(profile.assessmentHighlights),
    pathwayHighlights: serializeJsonArray(profile.pathwayHighlights),
    companionHighlights: serializeJsonArray(profile.companionHighlights),
    documentHighlights: serializeJsonArray(profile.documentHighlights),
    contact: profile.contactVisibility === "email" && profile.recruiterContactEmail ? { email: profile.recruiterContactEmail } : null,
    lastPublishedAt: profile.lastPublishedAt?.toISOString() ?? null,
    viewCount: profile.viewCount,
    exportReady: true,
    poweredBy: "Blizzway",
  };
}

async function collectPublishDefaults(context: Career7Context) {
  const [bdp, user, onboarding, documents, companions, achievements] = await Promise.all([
    buildBdp(context),
    prisma.user.findFirstOrThrow({
      where: { id: context.userId, businessId: context.businessId, active: true, deletedAt: null },
      select: { name: true, email: true },
    }),
    prisma.blizzwayOnboardingProfile.findUnique({
      where: {
        businessModel_businessId_userId: {
          businessModel: context.businessModel,
          businessId: context.businessId,
          userId: context.userId,
        },
      },
    }),
    prisma.blizzwayDocument.findMany({
      where: {
        businessModel: context.businessModel,
        businessId: context.businessId,
        userId: context.userId,
        status: "parsed",
      },
      select: { documentType: true, originalFilename: true, parsedSummary: true },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
    prisma.blizzwayCompanionRun.findMany({
      where: { businessModel: context.businessModel, businessId: context.businessId, userId: context.userId, status: "COMPLETED" },
      select: { output: true, companion: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.blizzwayUserAchievement.findMany({
      where: { businessModel: context.businessModel, businessId: context.businessId, userId: context.userId, status: "UNLOCKED" },
      select: { achievementKey: true, rewardCredits: true, unlockedAt: true },
      orderBy: { unlockedAt: "desc" },
      take: 6,
    }),
  ]);

  const skills = asStringArray(onboarding?.skills, 16);
  const languages = asStringArray(onboarding?.languageGoals, 8);
  const careerGoals = asStringArray([...(bdp.studyGoals ?? []), ...(onboarding?.earningGoals && Array.isArray(onboarding.earningGoals) ? onboarding.earningGoals : [])], 10);
  const documentHighlights = documents.map((document) => ({
    type: document.documentType,
    title: document.originalFilename,
    summary: document.parsedSummary?.slice(0, 220) ?? "Parsed document available",
  }));
  const companionHighlights = companions.map((run) => {
    const output = run.output && typeof run.output === "object" && !Array.isArray(run.output) ? run.output as Record<string, unknown> : {};
    return {
      companion: run.companion.name,
      summary: cleanText(output.summary, 240) || "Completed Blizzway companion run",
    };
  });

  return {
    bdp,
    user,
    defaults: {
      headline: bdp.publicPreview.headline || `${user.name}'s Blizzway Digital Profile`,
      summary: bdp.publicPreview.summary || "A living career identity built with Blizzway.",
      careerGoals,
      skills,
      languages,
      assessmentHighlights: [
        `Profile strength ${bdp.profileStrength}%`,
        `Admissions readiness ${bdp.metrics.admissionsReadiness}%`,
        `${bdp.assessmentsCompleted} assessments completed`,
      ],
      pathwayHighlights: bdp.nexaSuggestions.slice(0, 5),
      documentHighlights,
      companionHighlights,
      achievements: achievements.map((item) => ({
        title: item.achievementKey.replace(/_/g, " "),
        description: item.rewardCredits > 0 ? `${item.rewardCredits} Blizzway credits earned` : "Achievement unlocked",
        unlockedAt: item.unlockedAt.toISOString(),
      })),
    },
  };
}

export async function getPublicBdpSettings(context: Career7Context) {
  let profile = await prisma.blizzwayPublicBdpProfile.findUnique({
    where: {
      businessModel_businessId_userId: {
        businessModel: context.businessModel,
        businessId: context.businessId,
        userId: context.userId,
      },
    },
  });

  if (!profile) {
    const { defaults, user } = await collectPublishDefaults(context);
    const publicSlug = await defaultSlugForUser(context.userId);
    profile = await prisma.blizzwayPublicBdpProfile.create({
      data: {
        businessModel: context.businessModel,
        businessId: context.businessId,
        userId: context.userId,
        publicSlug,
        headline: defaults.headline,
        summary: defaults.summary,
        skills: defaults.skills,
        languages: defaults.languages,
        careerGoals: defaults.careerGoals,
        assessmentHighlights: defaults.assessmentHighlights,
        pathwayHighlights: defaults.pathwayHighlights,
        documentHighlights: defaults.documentHighlights,
        companionHighlights: defaults.companionHighlights,
        achievements: defaults.achievements,
        recruiterContactEmail: user.email,
        contactVisibility: "hidden",
        privacySettings: {
          showDocuments: true,
          showCompanions: true,
          showAssessments: true,
          showAchievements: true,
        },
      },
    });
  }

  return profile;
}

export async function updatePublicBdpSettings(context: Career7Context, body: Record<string, unknown>) {
  const existing = await getPublicBdpSettings(context);
  const data: Prisma.BlizzwayPublicBdpProfileUpdateInput = {};

  if ("publicSlug" in body) {
    const result = validatePublicBdpSlug(body.publicSlug);
    if ("error" in result) throw new Error(`SLUG_INVALID:${result.error}`);
    const taken = await prisma.blizzwayPublicBdpProfile.findFirst({
      where: { publicSlug: result.slug, id: { not: existing.id } },
      select: { id: true },
    });
    if (taken) throw new Error("SLUG_TAKEN");
    data.publicSlug = result.slug;
  }

  if ("headline" in body) data.headline = cleanText(body.headline, 140) || existing.headline;
  if ("summary" in body) data.summary = cleanText(body.summary, 1200) || existing.summary;
  if ("location" in body) data.location = cleanText(body.location, 120) || null;
  if ("availability" in body) data.availability = cleanText(body.availability, 120) || null;
  if ("careerGoals" in body) data.careerGoals = asStringArray(body.careerGoals, 10);
  if ("skills" in body) data.skills = asStringArray(body.skills, 24);
  if ("languages" in body) data.languages = asStringArray(body.languages, 12);
  if ("education" in body) data.education = asStringArray(body.education, 12);
  if ("experience" in body) data.experience = asStringArray(body.experience, 12);
  if ("projects" in body) data.projects = asStringArray(body.projects, 12);
  if ("contactVisibility" in body) data.contactVisibility = body.contactVisibility === "email" ? "email" : "hidden";
  if ("recruiterContactEmail" in body) data.recruiterContactEmail = cleanText(body.recruiterContactEmail, 180) || null;
  if ("isPublic" in body) data.isPublic = body.isPublic === true;

  if ("privacySettings" in body && body.privacySettings && typeof body.privacySettings === "object" && !Array.isArray(body.privacySettings)) {
    data.privacySettings = body.privacySettings as Prisma.InputJsonObject;
  }

  return prisma.blizzwayPublicBdpProfile.update({ where: { id: existing.id }, data });
}

export async function publishPublicBdp(context: Career7Context) {
  const existing = await getPublicBdpSettings(context);
  const { defaults } = await collectPublishDefaults(context);

  return prisma.blizzwayPublicBdpProfile.update({
    where: { id: existing.id },
    data: {
      isPublic: true,
      lastPublishedAt: new Date(),
      assessmentHighlights: defaults.assessmentHighlights,
      pathwayHighlights: defaults.pathwayHighlights,
      documentHighlights: defaults.documentHighlights,
      companionHighlights: defaults.companionHighlights,
      achievements: defaults.achievements,
      skills: serializeJsonArray(existing.skills).length ? jsonArrayInput(existing.skills) : defaults.skills,
      languages: serializeJsonArray(existing.languages).length ? jsonArrayInput(existing.languages) : defaults.languages,
      careerGoals: serializeJsonArray(existing.careerGoals).length ? jsonArrayInput(existing.careerGoals) : defaults.careerGoals,
    },
  });
}

export async function getPublishedPublicBdp(slug: string) {
  const valid = validatePublicBdpSlug(slug);
  if ("error" in valid) return null;

  return prisma.blizzwayPublicBdpProfile.findFirst({
    where: { publicSlug: valid.slug, isPublic: true, businessModel: "blizzway" },
    include: { user: { select: { name: true } } },
  });
}

export async function incrementPublicBdpView(slug: string) {
  const profile = await getPublishedPublicBdp(slug);
  if (!profile) return null;

  return prisma.blizzwayPublicBdpProfile.update({
    where: { id: profile.id },
    data: { viewCount: { increment: 1 } },
  });
}
