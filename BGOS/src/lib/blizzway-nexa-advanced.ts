import OpenAI from "openai";
import type { Prisma } from "@prisma/client";

import { listResults } from "@/lib/blizzway-assessments";
import { listCompanions } from "@/lib/blizzway-companions";
import { getGamificationState } from "@/lib/blizzway-gamification";
import { buildBdp } from "@/lib/career7-data";
import type { Career7Context } from "@/lib/career7-auth";
import { ensureCareer7Wallet } from "@/lib/career7-wallet";
import { prisma } from "@/lib/prisma";

const MODEL = process.env.BLIZZWAY_NEXA_MODEL || "gpt-4o-mini";
const OUTPUT_VERSION = "blizzway_nexa_v1";
const safetyNote =
  "Guidance only: NEXA does not guarantee jobs, admissions, scholarships, visas, migration, income, legal, medical, or financial outcomes.";

type NexaIntent =
  | "general_guidance"
  | "daily_plan"
  | "bdp_improvement"
  | "assessment_interpretation"
  | "admissions_planning"
  | "learning_plan"
  | "earning_plan"
  | "document_review"
  | "pathway_correction"
  | "emotional_motivation";

export type AdvancedNexaResponse = {
  title: string;
  message: string;
  actionSteps: string[];
  recommendedModules: string[];
  recommendedCompanions: string[];
  recommendedAssessments: string[];
  pathwayImpact: string;
  bdpImpact: string;
  safetyNote: string;
  chips: string[];
  conversationId?: string;
  provider: "openai" | "rule_based";
  model: string;
  fallbackUsed: boolean;
  generatedAt: string;
  outputVersion: typeof OUTPUT_VERSION;
  contextSummary?: Record<string, unknown>;
};

function cleanText(value: unknown, max = 1800) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function asArray(value: Prisma.JsonValue | null | undefined) {
  return Array.isArray(value) ? value : [];
}

function detectIntent(message: string, quickAction?: string): NexaIntent {
  const text = `${quickAction ?? ""} ${message}`.toLowerCase();
  if (text.includes("today") || text.includes("daily") || text.includes("7 days")) return "daily_plan";
  if (text.includes("bdp") || text.includes("profile")) return "bdp_improvement";
  if (text.includes("assessment") || text.includes("test") || text.includes("score")) return "assessment_interpretation";
  if (text.includes("admission") || text.includes("college") || text.includes("visa") || text.includes("migration")) return "admissions_planning";
  if (text.includes("learn") || text.includes("skill")) return "learning_plan";
  if (text.includes("earn") || text.includes("job") || text.includes("internship") || text.includes("freelance")) return "earning_plan";
  if (text.includes("document") || text.includes("resume") || text.includes("sop") || text.includes("certificate")) return "document_review";
  if (text.includes("pathway") || text.includes("stuck") || text.includes("next quest")) return "pathway_correction";
  if (text.includes("confidence") || text.includes("motivat") || text.includes("stress") || text.includes("fear")) return "emotional_motivation";
  return "general_guidance";
}

const promptTemplates: Record<NexaIntent, string> = {
  general_guidance: "Give concise career pathway guidance using the full user context.",
  daily_plan: "Create a practical daily plan with 3 to 5 actions for today.",
  bdp_improvement: "Suggest concrete BDP improvements without exposing private raw data.",
  assessment_interpretation: "Interpret latest assessment results as guidance, not fixed labels.",
  admissions_planning: "Give admissions planning guidance with no admission, visa, or scholarship guarantees.",
  learning_plan: "Suggest Learning Garden actions based on goals, documents, and assessment gaps.",
  earning_plan: "Suggest ethical earning/job/internship/freelance actions without manipulative spending pressure.",
  document_review: "Use uploaded document summaries only, never raw private text, to suggest next steps.",
  pathway_correction: "Correct the pathway with next quests and low-risk progress steps.",
  emotional_motivation: "Be supportive and grounded. Do not diagnose or provide medical advice.",
};

export async function buildAdvancedNexaContext(context: Career7Context) {
  const [
    user,
    bdp,
    assessmentResults,
    documents,
    companions,
    recentRuns,
    gamification,
    wallet,
    onboarding,
  ] = await Promise.all([
    prisma.user.findFirst({
      where: { id: context.userId, businessId: context.businessId, active: true, deletedAt: null },
      select: { id: true, name: true, email: true, role: true },
    }),
    buildBdp(context),
    listResults(context),
    prisma.blizzwayDocument.findMany({
      where: { businessModel: context.businessModel, businessId: context.businessId, userId: context.userId, status: { in: ["uploaded", "parsed"] } },
      select: { documentType: true, originalFilename: true, parsedSummary: true, status: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
    listCompanions(context, {}),
    prisma.blizzwayCompanionRun.findMany({
      where: { businessModel: context.businessModel, businessId: context.businessId, userId: context.userId },
      select: { status: true, output: true, createdAt: true, companion: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    getGamificationState(context),
    ensureCareer7Wallet(context.businessId, context.userId),
    prisma.blizzwayOnboardingProfile.findUnique({
      where: { businessModel_businessId_userId: { businessModel: context.businessModel, businessId: context.businessId, userId: context.userId } },
    }),
  ]);

  return {
    user: { name: user?.name ?? "Blizzway user", role: user?.role ?? "member" },
    onboarding: onboarding ? {
      currentStatus: onboarding.currentStatus,
      dreamGoal: onboarding.dreamGoal,
      educationLevel: onboarding.educationLevel,
      skills: asArray(onboarding.skills).slice(0, 8),
      interests: asArray(onboarding.interests).slice(0, 8),
      languageGoals: asArray(onboarding.languageGoals).slice(0, 5),
      admissionsGoals: asArray(onboarding.admissionsGoals).slice(0, 5),
      earningGoals: asArray(onboarding.earningGoals).slice(0, 5),
      completionStatus: onboarding.completionStatus,
    } : null,
    bdp: {
      profileStrength: bdp.profileStrength,
      assessmentsCompleted: bdp.assessmentsCompleted,
      metrics: bdp.metrics,
      latestAssessment: bdp.latestAssessment,
      documentsReadiness: bdp.documentsReadiness,
      scholarshipReadiness: bdp.scholarshipReadiness,
      suggestions: bdp.nexaSuggestions.slice(0, 6),
    },
    assessmentResults: assessmentResults.slice(0, 5).map((result) => ({
      title: result.assessment.title,
      category: result.assessment.category,
      percentage: result.percentage,
      readinessLevel: result.readinessLevel,
      strengths: result.strengths,
      improvementAreas: result.improvementAreas,
    })),
    pathway: {
      level: gamification.progress.currentLevel,
      levelTitle: gamification.progress.currentLevelTitle,
      totalXp: gamification.progress.totalXp,
      nextQuest: gamification.nextQuest,
      streak: gamification.streak,
      achievements: gamification.achievements.filter((item) => item.status === "unlocked").slice(0, 6),
    },
    companions: {
      active: companions
        .filter((item) => item.blizzwayCompanionActivations.length > 0)
        .map((item) => ({ name: item.name, slug: item.slug }))
        .slice(0, 5),
      recommended: companions
        .filter((item) => item.isFeatured || item.isTrending)
        .map((item) => ({ name: item.name, slug: item.slug, category: item.companionCategory ?? item.category }))
        .slice(0, 5),
      recentRuns: recentRuns.map((run) => ({
        companion: run.companion.name,
        status: run.status,
        summary: typeof run.output === "object" && run.output && "summary" in run.output ? cleanText((run.output as { summary?: unknown }).summary, 240) : null,
      })),
    },
    documents: documents.map((document) => ({
      type: document.documentType,
      filename: document.originalFilename,
      status: document.status,
      summary: document.parsedSummary ? cleanText(document.parsedSummary, 260) : null,
    })),
    wallet: {
      balanceBand: wallet.balance >= 1000 ? "healthy" : wallet.balance >= 150 ? "usable" : "low",
      balance: wallet.balance,
      note: "Do not pressure the user to spend credits. Suggest free next steps first.",
    },
  };
}

function fallbackResponse(intent: NexaIntent, message: string, contextSummary: Awaited<ReturnType<typeof buildAdvancedNexaContext>>): AdvancedNexaResponse {
  const latest = contextSummary.assessmentResults[0];
  const quest = contextSummary.pathway.nextQuest;
  const hasDocs = contextSummary.documents.some((document) => document.summary);
  const actionSteps = [
    quest?.title ? `Complete: ${quest.title}` : "Complete one small pathway action today.",
    latest ? `Use your ${latest.title} result to improve one weak area.` : "Take Career Compass Starter to give NEXA a stronger signal.",
    hasDocs ? "Review one uploaded document summary and add one proof point to BDP." : "Upload or parse one useful career document in Soul Vault.",
  ];

  return {
    title: intent === "daily_plan" ? "Your NEXA plan for today" : "NEXA pathway guidance",
    message: `I read your current Blizzway signals and would keep this practical: ${actionSteps[0]} Then make one BDP or assessment improvement. ${message ? "Your question is being treated as guidance, not a guarantee." : ""}`,
    actionSteps,
    recommendedModules: ["BDP", "My Pathway", hasDocs ? "Soul Vault" : "Assessments"],
    recommendedCompanions: contextSummary.companions.recommended.map((item) => item.name).slice(0, 3),
    recommendedAssessments: latest ? ["Communication Readiness", "Job Readiness Scan"] : ["Career Compass Starter", "Learning Style Finder"],
    pathwayImpact: quest?.title ? `Supports next quest: ${quest.title}` : "Keeps pathway momentum active.",
    bdpImpact: `Can improve BDP strength from ${contextSummary.bdp.profileStrength}% by adding clearer proof and assessment signals.`,
    safetyNote,
    chips: ["Plan today", "Improve my BDP", "Recommend assessments", "Suggest companions", "Review documents"],
    provider: "rule_based",
    model: "fallback",
    fallbackUsed: true,
    generatedAt: new Date().toISOString(),
    outputVersion: OUTPUT_VERSION,
  };
}

function normalizeArray(value: unknown, fallback: string[]) {
  return Array.isArray(value) ? value.map((item) => cleanText(item, 160)).filter(Boolean).slice(0, 6) : fallback;
}

function normalizeAiResponse(raw: unknown, fallback: AdvancedNexaResponse): AdvancedNexaResponse {
  const value = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  return {
    ...fallback,
    title: cleanText(value.title, 120) || fallback.title,
    message: cleanText(value.message, 1000) || fallback.message,
    actionSteps: normalizeArray(value.actionSteps, fallback.actionSteps),
    recommendedModules: normalizeArray(value.recommendedModules, fallback.recommendedModules),
    recommendedCompanions: normalizeArray(value.recommendedCompanions, fallback.recommendedCompanions),
    recommendedAssessments: normalizeArray(value.recommendedAssessments, fallback.recommendedAssessments),
    pathwayImpact: cleanText(value.pathwayImpact, 300) || fallback.pathwayImpact,
    bdpImpact: cleanText(value.bdpImpact, 300) || fallback.bdpImpact,
    safetyNote: cleanText(value.safetyNote, 500) || safetyNote,
    provider: "openai",
    model: MODEL,
    fallbackUsed: false,
    generatedAt: new Date().toISOString(),
    outputVersion: OUTPUT_VERSION,
  };
}

async function callOpenAi(intent: NexaIntent, userMessage: string, nexaContext: Awaited<ReturnType<typeof buildAdvancedNexaContext>>, fallback: AdvancedNexaResponse) {
  if (!process.env.OPENAI_API_KEY) return fallback;
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            "You are NEXA, Blizzway's Guardian Angel AI career guide.",
            "Be intelligent, warm, direct, concise, emotionally supportive, and practical.",
            "Never guarantee jobs, admissions, scholarships, visas, migration, income, legal, medical, or financial outcomes.",
            "Never profile protected attributes. Never pressure wallet spending. Recommend free steps first.",
            "Use document summaries only; never request or reveal raw private documents or raw assessment answers.",
            "Return only JSON with: title, message, actionSteps, recommendedModules, recommendedCompanions, recommendedAssessments, pathwayImpact, bdpImpact, safetyNote.",
          ].join(" "),
        },
        {
          role: "user",
          content: JSON.stringify({
            intent,
            template: promptTemplates[intent],
            userMessage,
            context: nexaContext,
          }),
        },
      ],
      temperature: 0.45,
    });
    const content = response.choices[0]?.message?.content;
    return normalizeAiResponse(content ? JSON.parse(content) : null, fallback);
  } catch (error) {
    console.error("[blizzway:nexa:openai]", error);
    return fallback;
  }
}

function conversationMessages(existing: Prisma.JsonValue, userMessage: string, reply: AdvancedNexaResponse) {
  const base = Array.isArray(existing) ? existing : [];
  return [
    ...base,
    { role: "user", content: userMessage, createdAt: new Date().toISOString() },
    { role: "assistant", content: reply.message, structured: reply, createdAt: reply.generatedAt },
  ].slice(-30) as Prisma.InputJsonValue;
}

export async function generateAdvancedNexaResponse(context: Career7Context, input: {
  message: string;
  quickAction?: string;
  conversationId?: string;
  intent?: NexaIntent;
}) {
  const userMessage = cleanText(input.message || input.quickAction, 1000);
  const intent = input.intent ?? detectIntent(userMessage, input.quickAction);
  const nexaContext = await buildAdvancedNexaContext(context);
  const fallback = fallbackResponse(intent, userMessage, nexaContext);
  const reply = await callOpenAi(intent, userMessage, nexaContext, fallback);
  const existing = input.conversationId
    ? await prisma.blizzwayNexaConversation.findFirst({
        where: { id: input.conversationId, businessModel: context.businessModel, businessId: context.businessId, userId: context.userId },
      })
    : null;
  const title = existing?.title ?? (reply.title || userMessage || "NEXA conversation").slice(0, 80);
  const conversation = await prisma.blizzwayNexaConversation.upsert({
    where: { id: existing?.id ?? "new-conversation" },
    create: {
      businessModel: context.businessModel,
      businessId: context.businessId,
      userId: context.userId,
      title,
      intent,
      messages: conversationMessages([], userMessage, reply),
      contextSummary: {
        bdpStrength: nexaContext.bdp.profileStrength,
        assessments: nexaContext.assessmentResults.length,
        documents: nexaContext.documents.length,
        pathwayLevel: nexaContext.pathway.level,
      },
      provider: reply.provider,
      model: reply.model,
      fallbackUsed: reply.fallbackUsed,
      generatedAt: new Date(reply.generatedAt),
    },
    update: {
      intent,
      messages: conversationMessages(existing?.messages ?? [], userMessage, reply),
      contextSummary: {
        bdpStrength: nexaContext.bdp.profileStrength,
        assessments: nexaContext.assessmentResults.length,
        documents: nexaContext.documents.length,
        pathwayLevel: nexaContext.pathway.level,
      },
      provider: reply.provider,
      model: reply.model,
      fallbackUsed: reply.fallbackUsed,
      generatedAt: new Date(reply.generatedAt),
    },
  });

  return {
    ...reply,
    conversationId: conversation.id,
    contextSummary: conversation.contextSummary as Record<string, unknown>,
  };
}

export async function listNexaConversations(context: Career7Context) {
  return prisma.blizzwayNexaConversation.findMany({
    where: { businessModel: context.businessModel, businessId: context.businessId, userId: context.userId },
    select: { id: true, title: true, intent: true, provider: true, fallbackUsed: true, generatedAt: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 30,
  });
}

export async function getNexaConversation(context: Career7Context, id: string) {
  return prisma.blizzwayNexaConversation.findFirst({
    where: { id, businessModel: context.businessModel, businessId: context.businessId, userId: context.userId },
  });
}

export async function buildDailyPlan(context: Career7Context) {
  return generateAdvancedNexaResponse(context, { message: "Create my daily NEXA plan for today.", intent: "daily_plan" });
}

export async function recommendNextActions(context: Career7Context) {
  return generateAdvancedNexaResponse(context, { message: "Recommend my next best Blizzway actions.", intent: "pathway_correction" });
}
