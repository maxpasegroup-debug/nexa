import type { BlizzwayAssessmentDefinition, BlizzwayAssessmentQuestion, Prisma } from "@prisma/client";

import type { Career7Context } from "@/lib/career7-auth";
import { completePathwayQuest, unlockAchievement } from "@/lib/blizzway-gamification";
import { BLIZZWAY_BUSINESS_MODEL, debitCareer7Credits, ensureCareer7Wallet } from "@/lib/career7-wallet";
import { prisma } from "@/lib/prisma";

const RESULT_VERSION = "assessment_result_v1";
const safetyNote =
  "Blizzway assessments are guidance tools only. They are not clinical, medical, hiring, admissions, visa, legal, or financial guarantees.";

type StarterAssessment = {
  slug: string;
  title: string;
  category: string;
  description: string;
  purpose: string;
  timeRequired: string;
  creditCost: number;
  repeatable: boolean;
  bdpImpactLabel: string;
  dimensions: string[];
};

type SerializedAssessment = ReturnType<typeof serializeAssessment>;

const starters: StarterAssessment[] = [
  ["career-compass-starter", "Career Compass Starter", "Career Tests", "Maps interest, motivation, and role-fit direction.", "Help NEXA understand early career direction.", "12 min", 0, true, "Career clarity", ["career_clarity", "motivation", "confidence"]],
  ["personality-snapshot", "Personality Snapshot", "Psychometric", "A non-clinical snapshot of working style and growth preferences.", "Guide reflection and better pathway choices.", "10 min", 0, true, "Self-awareness", ["self_awareness", "work_style", "adaptability"]],
  ["communication-readiness", "Communication Readiness", "Communication", "Checks expression, listening, structure, and interview presence.", "Improve communication readiness and confidence.", "15 min", 80, true, "Communication readiness", ["communication", "listening", "presence"]],
  ["learning-style-finder", "Learning Style Finder", "Learning Style", "Identifies practical learning preferences and study rhythm.", "Make Learning Garden recommendations sharper.", "10 min", 0, true, "Learning fit", ["learning_style", "consistency", "focus"]],
  ["global-readiness-check", "Global Readiness Check", "Global Readiness", "Checks language, documentation, cultural, and adaptation readiness.", "Support study/work abroad planning.", "18 min", 120, true, "Global readiness", ["global_readiness", "language_confidence", "cultural_intelligence"]],
  ["academic-readiness-check", "Academic Readiness Check", "Academic Readiness", "Checks study preparedness, entrance planning, and academic confidence.", "Improve admissions and academic next steps.", "16 min", 0, true, "Academic readiness", ["academic_readiness", "study_consistency", "exam_planning"]],
  ["job-readiness-scan", "Job Readiness Scan", "Job Readiness", "Checks resume, portfolio, interview, and opportunity readiness.", "Prepare for internships, jobs, and first offers.", "14 min", 100, true, "Job readiness", ["job_readiness", "portfolio_proof", "interview_readiness"]],
  ["happiness-focus-snapshot", "Happiness & Focus Snapshot", "Happiness & Wellbeing", "A non-clinical reflection on focus, energy, and growth happiness.", "Help NEXA protect momentum and confidence.", "9 min", 0, true, "Focus and wellbeing", ["focus", "energy", "confidence"]],
  ["leadership-potential", "Leadership Potential", "Leadership", "Checks initiative, ownership, influence, and decision rhythm.", "Guide leadership growth actions.", "12 min", 90, true, "Leadership signal", ["leadership", "ownership", "decision_making"]],
  ["entrepreneur-readiness", "Entrepreneur Readiness", "Entrepreneurship", "Checks problem clarity, selling comfort, discipline, and risk awareness.", "Guide practical entrepreneurship next steps.", "14 min", 100, true, "Entrepreneurship readiness", ["entrepreneurship", "market_clarity", "money_discipline"]],
].map(([slug, title, category, description, purpose, timeRequired, creditCost, repeatable, bdpImpactLabel, dimensions]) => ({
  slug,
  title,
  category,
  description,
  purpose,
  timeRequired,
  creditCost,
  repeatable,
  bdpImpactLabel,
  dimensions,
})) as StarterAssessment[];

function starterQuestions(assessment: StarterAssessment) {
  return assessment.dimensions.map((dimension, index) => ({
    questionKey: `${dimension}-q${index + 1}`,
    prompt: `How strong is your current ${dimension.replace(/_/g, " ")}?`,
    questionType: "scale",
    dimensionKey: dimension,
    sortOrder: index + 1,
    options: [1, 2, 3, 4, 5].map((score) => ({
      optionKey: String(score),
      label: ["Not yet", "Emerging", "Steady", "Strong", "Excellent"][score - 1],
      score,
      sortOrder: score,
    })),
  }));
}

function cleanText(value: unknown, max = 1200) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function jsonArray(value: Prisma.JsonValue | null | undefined) {
  return Array.isArray(value) ? value : [];
}

function definitionStatus(definition: BlizzwayAssessmentDefinition, completedSlugs: Set<string>) {
  if (completedSlugs.has(definition.slug)) return definition.repeatable ? "completed_repeatable" : "completed";
  if (definition.status === "recommended") return "recommended";
  return "available";
}

export async function ensureBlizzwayAssessmentSeeds(businessModel = BLIZZWAY_BUSINESS_MODEL) {
  for (const starter of starters) {
    const assessment = await prisma.blizzwayAssessmentDefinition.upsert({
      where: { businessModel_slug: { businessModel, slug: starter.slug } },
      create: {
        businessModel,
        slug: starter.slug,
        title: starter.title,
        category: starter.category,
        description: starter.description,
        purpose: starter.purpose,
        timeRequired: starter.timeRequired,
        creditCost: starter.creditCost,
        isFree: starter.creditCost === 0,
        pricingMode: starter.creditCost === 0 ? "free" : "paid",
        repeatable: starter.repeatable,
        status: starter.slug === "career-compass-starter" ? "recommended" : "active",
        bdpImpactLabel: starter.bdpImpactLabel,
        dimensionsMeasured: starter.dimensions,
        questionSet: starterQuestions(starter) as Prisma.InputJsonValue,
        metadata: { seed: "phase17" },
      },
      update: {
        title: starter.title,
        category: starter.category,
        description: starter.description,
        purpose: starter.purpose,
        timeRequired: starter.timeRequired,
        creditCost: starter.creditCost,
        isFree: starter.creditCost === 0,
        pricingMode: starter.creditCost === 0 ? "free" : "paid",
        active: true,
        bdpImpactLabel: starter.bdpImpactLabel,
        dimensionsMeasured: starter.dimensions,
      },
    });

    for (const question of starterQuestions(starter)) {
      const savedQuestion = await prisma.blizzwayAssessmentQuestion.upsert({
        where: { assessmentId_questionKey: { assessmentId: assessment.id, questionKey: question.questionKey } },
        create: {
          businessModel,
          assessmentId: assessment.id,
          questionKey: question.questionKey,
          prompt: question.prompt,
          questionType: question.questionType,
          dimensionKey: question.dimensionKey,
          sortOrder: question.sortOrder,
          metadata: { seed: "phase17" },
        },
        update: {
          prompt: question.prompt,
          questionType: question.questionType,
          dimensionKey: question.dimensionKey,
          sortOrder: question.sortOrder,
        },
      });

      for (const option of question.options) {
        await prisma.blizzwayAssessmentOption.upsert({
          where: { questionId_optionKey: { questionId: savedQuestion.id, optionKey: option.optionKey } },
          create: { businessModel, questionId: savedQuestion.id, ...option },
          update: { label: option.label, score: option.score, sortOrder: option.sortOrder },
        });
      }
    }
  }
}

export function serializeAssessment(
  definition: BlizzwayAssessmentDefinition & { questions?: Array<BlizzwayAssessmentQuestion & { options?: unknown[] }> },
  completedSlugs = new Set<string>(),
) {
  const dimensions = jsonArray(definition.dimensionsMeasured).map(String);
  return {
    id: definition.id,
    slug: definition.slug,
    title: definition.title,
    category: definition.category,
    description: definition.description,
    purpose: definition.purpose ?? definition.description,
    measures: dimensions,
    dimensionsMeasured: dimensions,
    timeRequired: definition.timeRequired ?? "10 min",
    creditCost: definition.creditCost,
    isFree: definition.isFree || definition.creditCost === 0,
    bdpImpact: definition.bdpImpactLabel ?? "Improves BDP intelligence",
    bdpImpactLabel: definition.bdpImpactLabel ?? "Improves BDP intelligence",
    repeatable: definition.repeatable,
    nexaRecommendation: `Recommended when you want stronger ${definition.category.toLowerCase()} guidance.`,
    status: definitionStatus(definition, completedSlugs),
    admissionsSignal: ["Academic Readiness", "Global Readiness", "Migration Readiness"].includes(definition.category),
    disclaimer: safetyNote,
    questions: definition.questions?.map((question) => ({
      id: question.id,
      questionKey: question.questionKey,
      prompt: question.prompt,
      questionType: question.questionType,
      dimensionKey: question.dimensionKey,
      sortOrder: question.sortOrder,
      options: (question.options as Array<{ id: string; optionKey: string; label: string; score: number; sortOrder: number }> | undefined)?.map((option) => ({
        id: option.id,
        optionKey: option.optionKey,
        label: option.label,
        score: option.score,
        sortOrder: option.sortOrder,
      })) ?? [],
    })) ?? [],
  };
}

export async function listAssessments(context: Career7Context): Promise<{
  assessments: SerializedAssessment[];
  total: number;
  completed: ReturnType<typeof serializeResultSummary>[];
  recommended: Array<SerializedAssessment & { reason: string }>;
  bdpImpact: ReturnType<typeof buildBdpImpact>;
}> {
  await ensureBlizzwayAssessmentSeeds(context.businessModel);
  const [definitions, results] = await Promise.all([
    prisma.blizzwayAssessmentDefinition.findMany({
      where: { businessModel: context.businessModel, active: true },
      orderBy: [{ status: "desc" }, { category: "asc" }, { title: "asc" }],
    }),
    prisma.blizzwayAssessmentResult.findMany({
      where: { businessModel: context.businessModel, businessId: context.businessId, userId: context.userId },
      include: { assessment: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);
  const completedSlugs = new Set(results.map((result) => result.assessment.slug));
  const assessments = definitions.map((definition) => serializeAssessment(definition, completedSlugs));
  const recommended: Array<SerializedAssessment & { reason: string }> = await recommendAssessments(context, assessments);
  return {
    assessments,
    total: assessments.length,
    completed: results.map(serializeResultSummary),
    recommended,
    bdpImpact: buildBdpImpact(results),
  };
}

export async function getAssessmentDetail(context: Career7Context, slug: string) {
  await ensureBlizzwayAssessmentSeeds(context.businessModel);
  const definition = await prisma.blizzwayAssessmentDefinition.findUnique({
    where: { businessModel_slug: { businessModel: context.businessModel, slug } },
    include: { questions: { include: { options: { orderBy: { sortOrder: "asc" } } }, orderBy: { sortOrder: "asc" } } },
  });
  if (!definition || !definition.active) return null;
  return serializeAssessment(definition);
}

export async function startAssessment(context: Career7Context, slug: string, idempotencyKey?: string) {
  await ensureBlizzwayAssessmentSeeds(context.businessModel);
  const definition = await prisma.blizzwayAssessmentDefinition.findUnique({
    where: { businessModel_slug: { businessModel: context.businessModel, slug } },
  });
  if (!definition || !definition.active) throw new Error("ASSESSMENT_NOT_FOUND");

  const scopedKey = idempotencyKey || `assessment-start:${context.businessModel}:${context.businessId}:${context.userId}:${slug}:${Date.now()}`;
  const existing = await prisma.blizzwayAssessmentAttempt.findUnique({ where: { idempotencyKey: scopedKey } });
  if (existing) return { attempt: existing, duplicate: true };

  let ledgerId: string | null = null;
  const creditCost = definition.isFree ? 0 : definition.creditCost;
  if (creditCost > 0) {
    const debit = await debitCareer7Credits({
      businessModel: context.businessModel,
      businessId: context.businessId,
      userId: context.userId,
      amount: creditCost,
      description: `Assessment: ${definition.title}`,
      idempotencyKey: `assessment-ledger:${scopedKey}`,
      metadata: { assessmentSlug: slug, assessmentId: definition.id },
    });
    if (!debit.ok) throw new Error("INSUFFICIENT_CREDITS");
    ledgerId = debit.ledger.id;
  } else {
    await ensureCareer7Wallet(context.businessId, context.userId);
  }

  const attempt = await prisma.blizzwayAssessmentAttempt.create({
    data: {
      businessModel: context.businessModel,
      businessId: context.businessId,
      userId: context.userId,
      assessmentId: definition.id,
      idempotencyKey: scopedKey,
      creditsCharged: creditCost,
      ledgerId,
      metadata: { slug },
    },
  });
  return { attempt, duplicate: false };
}

function answerScore(question: BlizzwayAssessmentQuestion & { options: Array<{ optionKey: string; score: number }> }, value: unknown) {
  if (question.questionType === "scale") {
    const score = typeof value === "number" ? value : Number(value);
    return Number.isFinite(score) ? Math.max(0, Math.min(5, Math.round(score))) : 0;
  }
  if (question.questionType === "multiple_choice" && Array.isArray(value)) {
    const selected = new Set(value.map(String));
    return question.options.filter((option) => selected.has(option.optionKey)).reduce((sum, option) => sum + option.score, 0);
  }
  const selected = question.options.find((option) => option.optionKey === String(value));
  return selected?.score ?? 0;
}

export async function saveAssessmentAnswer(context: Career7Context, attemptId: string, questionId: string, value: unknown) {
  const attempt = await prisma.blizzwayAssessmentAttempt.findFirst({
    where: { id: attemptId, businessModel: context.businessModel, businessId: context.businessId, userId: context.userId },
  });
  if (!attempt || attempt.status !== "IN_PROGRESS") throw new Error("ATTEMPT_NOT_FOUND");
  const question = await prisma.blizzwayAssessmentQuestion.findFirst({
    where: { id: questionId, assessmentId: attempt.assessmentId },
    include: { options: true },
  });
  if (!question) throw new Error("QUESTION_NOT_FOUND");
  const score = answerScore(question, value);
  return prisma.blizzwayAssessmentAnswer.upsert({
    where: { attemptId_questionId: { attemptId, questionId } },
    create: {
      businessModel: context.businessModel,
      businessId: context.businessId,
      userId: context.userId,
      attemptId,
      questionId,
      value: { value } as Prisma.InputJsonValue,
      score,
    },
    update: { value: { value } as Prisma.InputJsonValue, score },
  });
}

function readinessLevel(percentage: number) {
  if (percentage >= 82) return "Strong";
  if (percentage >= 64) return "Ready with focus";
  if (percentage >= 45) return "Emerging";
  return "Needs foundation";
}

function resultInsight(title: string, percentage: number, level: string, strengths: string[], gaps: string[]) {
  return `NEXA reads your ${title} result as ${level.toLowerCase()} (${percentage}%). Build on ${strengths.join(", ") || "your current awareness"} and focus next on ${gaps.join(", ") || "one small improvement area"}. This is guidance, not a fixed label.`;
}

async function updateBdpFromResult(context: Career7Context, result: { percentage: number; readinessLevel: string; dimensionScores: unknown[]; assessmentTitle: string; category: string }) {
  const existing = await prisma.blizzwayBdpProfile.findUnique({
    where: { businessModel_businessId_userId: { businessModel: context.businessModel, businessId: context.businessId, userId: context.userId } },
  });
  const readiness = {
    ...(existing?.readiness && typeof existing.readiness === "object" && !Array.isArray(existing.readiness) ? existing.readiness : {}),
    latestAssessment: {
      title: result.assessmentTitle,
      category: result.category,
      percentage: result.percentage,
      readinessLevel: result.readinessLevel,
      dimensions: result.dimensionScores,
    },
  } as Prisma.InputJsonObject;
  const profileStrength = Math.min(100, Math.max(existing?.profileStrength ?? 35, 45 + Math.round(result.percentage / 2)));

  return prisma.blizzwayBdpProfile.upsert({
    where: { businessModel_businessId_userId: { businessModel: context.businessModel, businessId: context.businessId, userId: context.userId } },
    create: {
      businessModel: context.businessModel,
      businessId: context.businessId,
      userId: context.userId,
      headline: "Blizzway Digital Profile",
      currentStageSummary: "Assessment intelligence is now shaping this BDP.",
      readiness,
      recommendedActions: ["Review assessment insight", "Add one proof item", "Run a relevant companion"],
      profileStrength,
      source: "assessment_engine_v1",
    },
    update: {
      readiness,
      profileStrength,
      recommendedActions: ["Review latest assessment insight", "Update BDP public sections", "Add next pathway quest"],
      source: "assessment_engine_v1",
    },
  });
}

export async function submitAssessment(context: Career7Context, attemptId: string) {
  const attempt = await prisma.blizzwayAssessmentAttempt.findFirst({
    where: { id: attemptId, businessModel: context.businessModel, businessId: context.businessId, userId: context.userId },
    include: {
      result: true,
      assessment: { include: { questions: { include: { options: true } } } },
      answers: { include: { question: true } },
    },
  });
  if (!attempt) throw new Error("ATTEMPT_NOT_FOUND");
  if (attempt.result) {
    return { result: serializeResultSummary({ ...attempt.result, assessment: attempt.assessment }), duplicate: true };
  }

  const maxScore = Math.max(1, attempt.assessment.questions.length * 5);
  const totalScore = attempt.answers.reduce((sum, answer) => sum + answer.score, 0);
  const percentage = Math.round((totalScore / maxScore) * 100);
  const dimensions = new Map<string, { score: number; max: number }>();
  for (const question of attempt.assessment.questions) {
    const answer = attempt.answers.find((item) => item.questionId === question.id);
    const current = dimensions.get(question.dimensionKey) ?? { score: 0, max: 0 };
    current.score += answer?.score ?? 0;
    current.max += 5;
    dimensions.set(question.dimensionKey, current);
  }
  const dimensionScores = Array.from(dimensions.entries()).map(([key, value]) => ({
    key,
    label: key.replace(/_/g, " "),
    score: value.score,
    maxScore: value.max,
    percentage: Math.round((value.score / Math.max(1, value.max)) * 100),
  }));
  const strengths = dimensionScores.filter((item) => item.percentage >= 70).map((item) => item.label).slice(0, 4);
  const improvementAreas = dimensionScores.filter((item) => item.percentage < 70).map((item) => item.label).slice(0, 4);
  const level = readinessLevel(percentage);
  const recommendations = [
    `Run a companion related to ${attempt.assessment.category.toLowerCase()}.`,
    "Add one proof note to Soul Vault.",
    "Use this result to choose your next pathway quest.",
  ];
  const aiInsight = resultInsight(attempt.assessment.title, percentage, level, strengths, improvementAreas);
  const result = await prisma.blizzwayAssessmentResult.create({
    data: {
      businessModel: context.businessModel,
      businessId: context.businessId,
      userId: context.userId,
      attemptId,
      assessmentId: attempt.assessmentId,
      totalScore,
      maxScore,
      percentage,
      percentile: Math.min(99, Math.max(1, percentage)),
      readinessLevel: level,
      dimensionScores: dimensionScores as Prisma.InputJsonValue,
      strengths,
      improvementAreas,
      recommendations,
      aiInsight,
      bdpImpact: { updated: true, label: attempt.assessment.bdpImpactLabel ?? "BDP intelligence improved" },
      pathwayImpact: { quest: "take_first_assessment", xpEligible: true },
      safetyNote,
      generatedBy: "rule_based",
      outputVersion: RESULT_VERSION,
    },
  });
  await prisma.blizzwayAssessmentAttempt.update({
    where: { id: attemptId },
    data: { status: "SUBMITTED", submittedAt: new Date() },
  });
  await Promise.allSettled([
    updateBdpFromResult(context, {
      assessmentTitle: attempt.assessment.title,
      category: attempt.assessment.category,
      percentage,
      readinessLevel: level,
      dimensionScores,
    }),
    completePathwayQuest(context, "take_first_assessment", { source: "assessment_submit", resultId: result.id }),
    unlockAchievement(context, "self_discovery", { source: "assessment_submit", resultId: result.id }),
  ]);

  return { result: serializeResultSummary({ ...result, assessment: attempt.assessment }), duplicate: false };
}

export function serializeResultSummary(result: {
  id: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  readinessLevel: string;
  dimensionScores: Prisma.JsonValue;
  strengths: Prisma.JsonValue;
  improvementAreas: Prisma.JsonValue;
  recommendations: Prisma.JsonValue;
  aiInsight: string;
  bdpImpact: Prisma.JsonValue;
  pathwayImpact: Prisma.JsonValue;
  safetyNote: string;
  createdAt: Date;
  assessment: { slug: string; title: string; category: string };
}) {
  return {
    id: result.id,
    assessment: result.assessment,
    totalScore: result.totalScore,
    maxScore: result.maxScore,
    percentage: result.percentage,
    percentile: result.percentage,
    readinessLevel: result.readinessLevel,
    dimensionScores: jsonArray(result.dimensionScores),
    strengths: jsonArray(result.strengths),
    improvementAreas: jsonArray(result.improvementAreas),
    recommendations: jsonArray(result.recommendations),
    aiInsight: result.aiInsight,
    bdpImpact: result.bdpImpact,
    pathwayImpact: result.pathwayImpact,
    safetyNote: result.safetyNote,
    createdAt: result.createdAt.toISOString(),
  };
}

function buildBdpImpact(results: Array<{ percentage: number }>) {
  const latest = results[0];
  return {
    profileStrength: latest ? Math.min(100, 45 + Math.round(latest.percentage / 2)) : 35,
    admissionsReadiness: latest?.percentage ?? 35,
    intelligenceScore: latest?.percentage ?? 35,
    message: latest ? "Assessment intelligence is updating your BDP and pathway guidance." : "Complete a starter assessment to improve BDP intelligence.",
  };
}

export async function listResults(context: Career7Context) {
  const results = await prisma.blizzwayAssessmentResult.findMany({
    where: { businessModel: context.businessModel, businessId: context.businessId, userId: context.userId },
    include: { assessment: true },
    orderBy: { createdAt: "desc" },
  });
  return results.map(serializeResultSummary);
}

export async function getResult(context: Career7Context, resultId: string) {
  const result = await prisma.blizzwayAssessmentResult.findFirst({
    where: { id: resultId, businessModel: context.businessModel, businessId: context.businessId, userId: context.userId },
    include: { assessment: true },
  });
  return result ? serializeResultSummary(result) : null;
}

export async function recommendAssessments(
  context: Career7Context,
  current?: SerializedAssessment[],
): Promise<Array<SerializedAssessment & { reason: string }>> {
  let assessments: SerializedAssessment[];
  if (current) {
    assessments = current;
  } else {
    await ensureBlizzwayAssessmentSeeds(context.businessModel);
    const definitions = await prisma.blizzwayAssessmentDefinition.findMany({
      where: { businessModel: context.businessModel, active: true },
      orderBy: [{ status: "desc" }, { category: "asc" }, { title: "asc" }],
    });
    assessments = definitions.map((definition) => serializeAssessment(definition));
  }
  const results = await prisma.blizzwayAssessmentResult.findMany({
    where: { businessModel: context.businessModel, businessId: context.businessId, userId: context.userId },
    include: { assessment: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  const completed = new Set(results.map((result) => result.assessment.slug));
  const priorities = ["career-compass-starter", "learning-style-finder", "communication-readiness", "job-readiness-scan", "global-readiness-check"];
  return assessments
    .filter((assessment: SerializedAssessment) => assessment.repeatable || !completed.has(assessment.slug))
    .sort((a: SerializedAssessment, b: SerializedAssessment) => priorities.indexOf(a.slug) - priorities.indexOf(b.slug))
    .slice(0, 4)
    .map((assessment: SerializedAssessment) => ({
      ...assessment,
      reason: completed.size ? "Recommended from your latest assessment gaps." : "Recommended as a starter intelligence signal.",
    }));
}

export function sanitizeAnswerValue(value: unknown) {
  if (typeof value === "string") return cleanText(value, 600);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.map((item) => cleanText(item, 120)).filter(Boolean).slice(0, 8);
  return "";
}
