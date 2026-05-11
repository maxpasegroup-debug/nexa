import { prisma } from "@/lib/prisma";
import type { Career7Context } from "@/lib/career7-auth";
import { ensureCareer7Wallet } from "@/lib/career7-wallet";
import { getBlizzwayVault } from "@/lib/blizzway-vault";
import { getBlizzwayOnboardingProfile } from "@/lib/blizzway-nexa-engine";

export const starterAssessments = [
  {
    slug: "career-compass-starter",
    title: "Career Compass Starter",
    category: "Career Tests",
    description: "A gentle first map of interests, motivation, and best-fit pathway direction.",
    purpose: "Help NEXA understand early career direction and confidence signals.",
    measures: ["Interest clusters", "Role-fit direction", "Motivation style", "Confidence blockers"],
    timeRequired: "12 min",
    creditCost: 0,
    bdpImpact: "Improves pathway accuracy",
    repeatable: true,
    nexaRecommendation: "Start here if your BDP is new or your direction feels scattered.",
    status: "available",
    admissionsSignal: false,
  },
  {
    slug: "academic-readiness-check",
    title: "Academic Readiness Check",
    category: "Academic Readiness",
    description: "Check study preparedness, entrance planning, and college application confidence.",
    purpose: "Improve national and international admissions pathway recommendations.",
    measures: ["Subject confidence", "Entrance readiness", "Study consistency", "Application preparedness"],
    timeRequired: "16 min",
    creditCost: 0,
    bdpImpact: "Improves admissions readiness",
    repeatable: true,
    nexaRecommendation: "Recommended before shortlisting colleges, courses, scholarships, or entrance exam plans.",
    status: "recommended",
    admissionsSignal: true,
  },
  {
    slug: "global-readiness-scan",
    title: "Global Readiness Scan",
    category: "Global Readiness",
    description: "Check readiness for international study, work, and cross-cultural environments.",
    purpose: "Give NEXA better signals for study abroad, migration, and global careers.",
    measures: ["Adaptability", "Documentation awareness", "Language confidence", "Cultural comfort"],
    timeRequired: "20 min",
    creditCost: 180,
    bdpImpact: "Improves global fit",
    repeatable: true,
    nexaRecommendation: "Recommended if your pathway includes study abroad, remote work, or migration.",
    status: "recommended",
    admissionsSignal: true,
  },
  {
    slug: "communication-spark",
    title: "Communication Spark",
    category: "Communication",
    description: "A practical readiness check for interviews, introductions, and confident expression.",
    purpose: "Reveal communication habits that affect interviews, networking, and public confidence.",
    measures: ["Clarity", "Listening", "Structure", "Presence"],
    timeRequired: "15 min",
    creditCost: 120,
    bdpImpact: "Improves confidence signal",
    repeatable: true,
    nexaRecommendation: "Useful before interviews, admissions conversations, and job readiness planning.",
    status: "available",
    admissionsSignal: true,
  },
];

export const starterAdmissions = [
  {
    slug: "india-computer-science-ug",
    title: "Computer Science UG Pathway",
    location: "India",
    countryRegion: "Indian Colleges",
    level: "UG",
    mode: "National",
    intakeDeadline: "July 2026 intake, forms open soon",
    eligibilityStatus: "Likely eligible",
    credits: "120 credits placeholder",
    eligibilitySummary: "Strong fit for students with mathematics, coding interest, and entrance exam preparation intent.",
    documents: ["Class 10 marksheet", "Class 12 marksheet", "Entrance score", "Identity proof"],
    deadlines: ["Entrance exam window: Apr-May 2026", "Counselling: Jun-Jul 2026", "Verification: Jul 2026"],
    budget: "INR 2L-12L per year placeholder",
    scholarships: ["Merit scholarship", "Need-based aid", "State education support"],
    nexaAdvice: "Pair Academic Readiness with Career Compass Starter before finalizing your shortlist.",
    recommendedAssessments: ["Academic Readiness Check", "Career Compass Starter"],
    recommendedCompanions: ["Admissions Companion", "Entrance Planner"],
  },
  {
    slug: "canada-business-diploma",
    title: "Business Diploma Canada Route",
    location: "Canada",
    countryRegion: "Study Abroad",
    level: "Diploma",
    mode: "International",
    intakeDeadline: "September 2026 intake, shortlist by March",
    eligibilityStatus: "Needs language proof",
    credits: "180 credits placeholder",
    eligibilitySummary: "Practical business exposure with international work-readiness planning.",
    documents: ["Academic transcripts", "Passport", "English test score", "SOP", "Financial proof"],
    deadlines: ["Shortlist: Feb 2026", "Applications: Mar-Apr 2026", "Visa file: Jun 2026"],
    budget: "CAD 18K-32K per year placeholder",
    scholarships: ["International entrance award", "College bursary", "Early applicant waiver"],
    nexaAdvice: "Complete Global Readiness Scan and Communication Spark before SOP drafting.",
    recommendedAssessments: ["Global Readiness Scan", "Communication Spark"],
    recommendedCompanions: ["Global Guide", "SOP Mentor"],
  },
];

export const quickBoosts = [
  {
    id: "resume-cocoa",
    title: "Resume Cocoa",
    description: "A focused resume polish for one role direction.",
    category: "Resume",
    creditPrice: 120,
    status: "available",
  },
  {
    id: "interview-truffle",
    title: "Interview Truffle",
    description: "A compact mock interview with warm feedback.",
    category: "Interview",
    creditPrice: 180,
    status: "available",
  },
  {
    id: "migration-mint",
    title: "Migration Mint",
    description: "Document and international pathway readiness checklist.",
    category: "Migration",
    creditPrice: 160,
    status: "available",
  },
];

export function serializeAgent(agent: Awaited<ReturnType<typeof getCareer7Agents>>[number]) {
  return {
    id: agent.id,
    slug: agent.slug,
    name: agent.name,
    category: agent.category,
    type: agent.career7Type?.toLowerCase() ?? null,
    creditPrice: agent.creditPrice,
    description: agent.description,
    icon: agent.icon,
    status: agent.career7Status.toLowerCase(),
    isPrebuilt: agent.isPrebuilt,
    isRequestable: agent.isRequestable,
    canAddToGrowthBoard: agent.canAddToGrowthBoard,
    colorPrimary: agent.colorPrimary,
    colorSecondary: agent.colorSecondary,
    gradient: agent.gradient,
    isFeatured: agent.isFeatured,
    sortOrder: agent.sortOrder,
  };
}

export async function getCareer7Agents() {
  return prisma.marketplaceAgent.findMany({
    where: {
      isActive: true,
      career7Type: { not: null },
      career7Status: { not: "ARCHIVED" },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getCareer7User(context: Career7Context) {
  return prisma.user.findFirstOrThrow({
    where: {
      id: context.userId,
      businessId: context.businessId,
      active: true,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      businessId: true,
      createdAt: true,
      business: { select: { id: true, name: true, type: true, plan: true } },
    },
  });
}

export async function buildBdp(context: Career7Context) {
  const [vault, wallet, boardCount, generatedBdp, documents] = await Promise.all([
    getBlizzwayVault(context),
    ensureCareer7Wallet(context.businessId, context.userId),
    prisma.career7GrowthBoardAgent.count({
      where: { businessId: context.businessId, userId: context.userId, status: "ACTIVE" },
    }),
    prisma.blizzwayBdpProfile.findUnique({
      where: {
        businessModel_businessId_userId: {
          businessModel: "blizzway",
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
        status: { in: ["uploaded", "parsed"] },
      },
      orderBy: { updatedAt: "desc" },
      take: 25,
    }),
  ]);

  const hasProfile = Boolean(vault.digitalProfile.summary || vault.digitalProfile.stage);
  const parsedDocuments = documents.filter((document) => document.status === "parsed");
  const documentTypes = new Set(documents.map((document) => document.documentType));
  const documentReadinessItems = [
    ["Academic transcripts", documentTypes.has("transcript") || documentTypes.has("marksheet")],
    ["Identity proof", documentTypes.has("passport_id")],
    ["SOP draft", documentTypes.has("sop_draft")],
    ["LOR draft", documentTypes.has("lor_draft")],
    ["Portfolio proof", documentTypes.has("portfolio") || documentTypes.has("certificate")],
  ] as const;
  const completedDocuments = documentReadinessItems.filter(([, complete]) => complete).length;
  const profileStrength = Math.min(
    100,
    25 +
      (hasProfile ? 25 : 0) +
      Math.min(20, vault.dreamGoals.length * 5) +
      Math.min(20, Object.keys(vault.onboardingAnswers).length * 3) +
      Math.min(10, boardCount * 2) +
      Math.min(10, parsedDocuments.length * 2),
  );

  return {
    id: `bdp-${context.userId}`,
    profileStrength: Math.max(profileStrength, generatedBdp?.profileStrength ?? 0),
    assessmentsCompleted: 0,
    walletCredits: wallet.balance,
    metrics: {
      iq: null,
      eq: null,
      cq: null,
      aq: null,
      lq: null,
      admissionsReadiness: Math.min(100, 35 + (hasProfile ? 15 : 0) + boardCount * 3 + completedDocuments * 6),
    },
    studyGoals: vault.dreamGoals,
    countryPreferences: [],
    documentsReadiness: {
      status: completedDocuments >= 4 ? "strong" : completedDocuments > 0 ? "in_progress" : "starter",
      completed: completedDocuments,
      total: 5,
      items: documentReadinessItems.map(([label, complete]) => `${label}: ${complete ? "ready" : "missing"}`),
    },
    scholarshipReadiness: {
      status: documentTypes.has("transcript") || documentTypes.has("marksheet") ? "in_progress" : "starter",
      score: Math.min(100, 30 + vault.dreamGoals.length * 5 + completedDocuments * 5),
      suggestions: [
        parsedDocuments.length ? "Review parsed document signals before scholarship shortlisting" : "Parse uploaded academic proof",
        "Complete Academic Readiness Check",
        "Save achievements in Soul Vault",
      ],
    },
    publicPreview: {
      headline: generatedBdp?.headline || vault.digitalProfile.stage || "Blizzway Explorer",
      summary: generatedBdp?.currentStageSummary || vault.digitalProfile.summary || "Your living career identity will grow as assessments, proof, and pathway signals are added.",
      strengths: Array.isArray(generatedBdp?.strengths) ? generatedBdp.strengths : vault.digitalProfile.strengths,
    },
    nexaSuggestions: Array.isArray(generatedBdp?.recommendedActions) ? generatedBdp.recommendedActions : [
      parsedDocuments[0]?.parsedSummary ? `Use uploaded document insight: ${parsedDocuments[0].parsedSummary.slice(0, 140)}` : "Upload and parse one resume, SOP, certificate, or transcript.",
      "Complete Academic Readiness Check before admissions shortlisting.",
      "Add two proof stories to Soul Vault.",
      "Choose one pathway companion from Magic Market.",
    ],
    updatedAt: vault.updatedAt || new Date().toISOString(),
  };
}

export function pathwaySteps(activeCount: number) {
  const base = [
    { id: "discover", title: "Discover direction with starter assessments", status: "active", progress: 35 },
    { id: "build-bdp", title: "Build BDP with proof and strengths", status: "available", progress: 20 },
    { id: "shortlist", title: "Shortlist career, course, or earning routes", status: "available", progress: 10 },
    { id: "launch", title: "Launch applications, interviews, or projects", status: "locked", progress: 0 },
  ];

  return base.map((step, index) => ({
    ...step,
    progress: Math.min(100, step.progress + activeCount * 5),
    status: index === 0 || activeCount > index ? step.status : step.status,
  }));
}

export async function buildStarterPathway(context: Career7Context, activeCount: number) {
  const generated = await prisma.blizzwayStarterPathway.findUnique({
    where: {
      businessModel_businessId_userId: {
        businessModel: "blizzway",
        businessId: context.businessId,
        userId: context.userId,
      },
    },
  });

  if (generated && Array.isArray(generated.milestones)) {
    const milestones = generated.milestones as Array<{ id?: string; title: string; status: string; progress: number }>;
    return {
      id: generated.id,
      title: generated.title,
      currentStepId: milestones[0]?.id ?? null,
      progress: generated.progress,
      xp: generated.xp,
      level: generated.level,
      achievementHooks: generated.achievementHooks,
      steps: milestones,
    };
  }

  const profile = await getBlizzwayOnboardingProfile(context);
  const steps = pathwaySteps(activeCount);
  return {
    id: `pathway-${context.userId}`,
    title: profile ? `${profile.dreamGoal} Starter Pathway` : "Starter Blizzway pathway",
    currentStepId: steps[0]?.id ?? null,
    progress: Math.min(100, 25 + activeCount * 10),
    xp: 0,
    level: 1,
    achievementHooks: [],
    steps,
  };
}
