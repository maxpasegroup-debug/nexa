import OpenAI from "openai";
import type { MarketplaceAgent, Prisma } from "@prisma/client";

const OUTPUT_VERSION = "blizzway_companion_output_v2";
const DEFAULT_MODEL = "gpt-4o-mini";
const MAX_FIELD_LENGTH = 1600;

const guidanceOnlyNote =
  "Guidance only: Blizzway companions do not guarantee jobs, admissions, scholarships, visas, income, medical, legal, or financial outcomes.";

type OutputSection = {
  heading: string;
  content?: string;
  bullets?: string[];
};

export type BlizzwayCompanionStructuredOutput = {
  title: string;
  summary: string;
  sections: OutputSection[];
  actionSteps: string[];
  warnings: string[];
  recommendedNextActions: string[];
  bdpImpact: string;
  pathwayImpact: string;
  nexaNote: string;
  missingInputs: string[];
  expectedOutput: string[];
  safetyNote: string;
  nextActions: string[];
  checklist: string[];
  provider: "openai" | "rule_based";
  model: string;
  promptTemplateKey: string;
  generatedAt: string;
  outputVersion: typeof OUTPUT_VERSION;
  fallbackUsed: boolean;
};

type PromptTemplate = {
  key: string;
  title: string;
  focus: string;
  outputInstructions: string[];
  requiredSignals: string[];
  warnings: string[];
};

const templates: Record<string, PromptTemplate> = {
  resume_architect: {
    key: "resume_architect",
    title: "Resume Architect",
    focus: "Create resume summary, ATS improvements, bullet rewrites, and skills suggestions.",
    outputInstructions: ["Resume summary", "ATS improvement suggestions", "Bullet rewrites", "Skills section suggestions"],
    requiredSignals: ["target role", "experience", "current resume status"],
    warnings: ["Do not promise interviews or jobs.", "Keep claims truthful and user-verifiable."],
  },
  linkedin_profile: {
    key: "linkedin_profile",
    title: "LinkedIn Profile",
    focus: "Improve headline, about section, featured section ideas, and profile steps.",
    outputInstructions: ["Headline options", "About section draft", "Featured section ideas", "Profile improvement steps"],
    requiredSignals: ["target role", "current profile status", "proof points"],
    warnings: ["Do not fabricate achievements.", "Do not promise recruiter reach or job offers."],
  },
  portfolio_builder: {
    key: "portfolio_builder",
    title: "Portfolio Builder",
    focus: "Design portfolio structure, project showcase format, and public profile suggestions.",
    outputInstructions: ["Portfolio structure", "Project showcase format", "Public profile suggestions"],
    requiredSignals: ["skill area", "projects", "target audience"],
    warnings: ["Do not invent project outcomes.", "Flag missing proof points."],
  },
  sop_builder: {
    key: "sop_builder",
    title: "SOP Builder",
    focus: "Create an SOP outline, draft sections, and improvement suggestions.",
    outputInstructions: ["SOP outline", "Draft sections", "Improvement suggestions"],
    requiredSignals: ["program", "country", "academic/professional background", "motivation"],
    warnings: ["Admissions guidance is advisory only.", "Do not guarantee admission."],
  },
  lor_builder: {
    key: "lor_builder",
    title: "LOR Builder",
    focus: "Prepare recommender brief, LOR structure, and draft guidance.",
    outputInstructions: ["Recommender brief", "LOR structure", "Draft guidance"],
    requiredSignals: ["recommender relationship", "achievements", "target program or role"],
    warnings: ["Do not impersonate a recommender.", "Do not fabricate achievements."],
  },
  sop_lor_builder: {
    key: "sop_lor_builder",
    title: "SOP/LOR Builder",
    focus: "Prepare SOP and LOR planning guidance for admissions.",
    outputInstructions: ["SOP outline", "Draft SOP sections", "Recommender brief", "LOR structure", "Improvement suggestions"],
    requiredSignals: ["program", "country", "background", "recommender context"],
    warnings: ["Admissions guidance is advisory only.", "Do not guarantee admission."],
  },
  interview_coach: {
    key: "interview_coach",
    title: "Interview Coach",
    focus: "Create likely questions, STAR answer framework, and feedback checklist.",
    outputInstructions: ["Likely questions", "STAR answer framework", "Feedback checklist"],
    requiredSignals: ["target role", "experience", "interview stage"],
    warnings: ["Do not promise selection.", "Keep answers truthful and role-specific."],
  },
  scholarship_matcher: {
    key: "scholarship_matcher",
    title: "Scholarship Matcher",
    focus: "Assess scholarship readiness, search strategy, and document checklist.",
    outputInstructions: ["Scholarship readiness", "Recommended search strategy", "Document checklist"],
    requiredSignals: ["country", "program level", "academic profile", "budget need"],
    warnings: ["Scholarship guidance is advisory only.", "Do not guarantee funding."],
  },
  visa_readiness: {
    key: "visa_readiness",
    title: "Visa Readiness",
    focus: "Create readiness checklist, risk areas, document guidance, and advisory disclaimer.",
    outputInstructions: ["Readiness checklist", "Risk areas", "Document guidance", "Advisory disclaimer"],
    requiredSignals: ["destination", "visa purpose", "timeline", "documents available"],
    warnings: ["Visa and migration guidance is advisory only.", "Direct user to official sources or qualified experts."],
  },
  english_speaking: {
    key: "english_speaking",
    title: "English Speaking",
    focus: "Build speaking practice, vocabulary focus, pronunciation drills, and daily tasks.",
    outputInstructions: ["Practice plan", "Speaking exercises", "Vocabulary focus", "Daily tasks"],
    requiredSignals: ["current level", "speaking goal", "daily practice time"],
    warnings: ["Do not shame the user.", "Keep feedback practical and confidence-building."],
  },
  ielts: {
    key: "ielts",
    title: "IELTS Companion",
    focus: "Build IELTS practice plan, skill drills, vocabulary focus, and daily tasks.",
    outputInstructions: ["Practice plan", "Speaking/writing exercises", "Vocabulary focus", "Daily tasks"],
    requiredSignals: ["target band", "test date", "weakest module"],
    warnings: ["Do not guarantee band scores.", "Encourage official practice materials."],
  },
  german_language: {
    key: "german_language",
    title: "German Language",
    focus: "Build German practice plan, speaking exercises, vocabulary focus, and daily tasks.",
    outputInstructions: ["Practice plan", "Speaking exercises", "Vocabulary focus", "Daily tasks"],
    requiredSignals: ["current CEFR level", "goal level", "daily practice time"],
    warnings: ["Do not guarantee exam outcomes.", "Keep tasks level-appropriate."],
  },
  career_compass: {
    key: "career_compass",
    title: "Career Compass",
    focus: "Summarize career direction, strengths, risks, and next steps.",
    outputInstructions: ["Career direction summary", "Strengths", "Risks", "Next steps"],
    requiredSignals: ["current stage", "interests", "constraints"],
    warnings: ["Do not guarantee job outcomes.", "Present options, not absolute decisions."],
  },
  communication_coach: {
    key: "communication_coach",
    title: "Communication Coach",
    focus: "Create communication practice drills, confidence scripts, and feedback checklist.",
    outputInstructions: ["Communication focus", "Practice exercises", "Vocabulary or phrasing", "Daily tasks"],
    requiredSignals: ["communication goal", "context", "current challenge"],
    warnings: ["Keep advice respectful and culturally sensitive."],
  },
  money_discipline: {
    key: "money_discipline",
    title: "Money Discipline",
    focus: "Create educational money habits, budget discipline, and risk-aware next steps.",
    outputInstructions: ["Money behavior summary", "Discipline plan", "Tracking checklist", "Next actions"],
    requiredSignals: ["income context", "spending challenge", "short-term goal"],
    warnings: ["Educational only, not regulated financial advice.", "Do not promise income, returns, or savings."],
  },
  focus_companion: {
    key: "focus_companion",
    title: "Focus Companion",
    focus: "Create focus plan, distraction controls, daily rhythm, and accountability steps.",
    outputInstructions: ["Focus diagnosis", "Daily focus plan", "Distraction controls", "Next actions"],
    requiredSignals: ["goal", "distractions", "available time"],
    warnings: ["Do not provide medical guidance.", "Suggest professional help for serious mental health concerns."],
  },
  confidence_companion: {
    key: "confidence_companion",
    title: "Confidence Companion",
    focus: "Create confidence-building actions, reflection prompts, and low-risk practice steps.",
    outputInstructions: ["Confidence summary", "Practice actions", "Reflection prompts", "Next actions"],
    requiredSignals: ["confidence challenge", "upcoming situation", "support available"],
    warnings: ["Do not provide medical guidance.", "Avoid toxic positivity."],
  },
  guardian_angel_pathway: {
    key: "guardian_angel_pathway",
    title: "Guardian Angel Pathway",
    focus: "Create personalized growth advice, pathway correction, and motivational guidance.",
    outputInstructions: ["Personalized growth advice", "Pathway correction", "Motivational guidance", "Next actions"],
    requiredSignals: ["current pathway", "recent progress", "biggest blocker"],
    warnings: ["Do not guarantee outcomes.", "Keep motivation grounded and actionable."],
  },
  general_companion: {
    key: "general_companion",
    title: "Blizzway Companion",
    focus: "Create a structured career/admissions pathway deliverable.",
    outputInstructions: ["Summary", "Generated sections", "Action steps", "Warnings", "Next recommended actions"],
    requiredSignals: ["goal", "current status", "main blocker"],
    warnings: ["Keep guidance advisory and outcome-safe."],
  },
};

function asStringArray(value: Prisma.JsonValue | null | undefined): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, MAX_FIELD_LENGTH) : "";
}

export function sanitizeCompanionInputs(inputs: Record<string, unknown>) {
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(inputs)) {
    const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 50);
    const rawValue = typeof value === "string" ? value : value === undefined || value === null ? "" : JSON.stringify(value);
    const safeValue = cleanText(rawValue);
    if (safeKey && safeValue) sanitized[safeKey] = safeValue;
  }
  return sanitized;
}

function templateKeyForAgent(agent: Pick<MarketplaceAgent, "slug" | "name" | "companionCategory" | "career7Type">) {
  const text = `${agent.slug} ${agent.name} ${agent.companionCategory ?? ""} ${agent.career7Type ?? ""}`.toLowerCase();
  if (text.includes("resume")) return "resume_architect";
  if (text.includes("linkedin")) return "linkedin_profile";
  if (text.includes("portfolio")) return "portfolio_builder";
  if (text.includes("sop") && text.includes("lor")) return "sop_lor_builder";
  if (text.includes("sop")) return "sop_builder";
  if (text.includes("lor")) return "lor_builder";
  if (text.includes("interview")) return "interview_coach";
  if (text.includes("scholarship")) return "scholarship_matcher";
  if (text.includes("visa")) return "visa_readiness";
  if (text.includes("english")) return "english_speaking";
  if (text.includes("ielts")) return "ielts";
  if (text.includes("german")) return "german_language";
  if (text.includes("career-compass") || text.includes("career compass")) return "career_compass";
  if (text.includes("communication")) return "communication_coach";
  if (text.includes("money")) return "money_discipline";
  if (text.includes("focus")) return "focus_companion";
  if (text.includes("confidence")) return "confidence_companion";
  if (text.includes("guardian")) return "guardian_angel_pathway";
  return "general_companion";
}

function missingInputsForTemplate(template: PromptTemplate, inputs: Record<string, string>) {
  const allInputText = Object.values(inputs).join(" ").toLowerCase();
  return template.requiredSignals.filter((signal) => !allInputText.includes(signal.split(" ")[0].toLowerCase()));
}

function safetyNoteForTemplate(template: PromptTemplate) {
  return [guidanceOnlyNote, ...template.warnings].join(" ");
}

function normalizeStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const items = value.map((item) => cleanText(item)).filter(Boolean);
  return items.length ? items.slice(0, 8) : fallback;
}

function normalizeSections(value: unknown, fallback: OutputSection[]) {
  if (!Array.isArray(value)) return fallback;
  const sections = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const heading = cleanText(record.heading);
      const content = cleanText(record.content);
      const bullets = normalizeStringArray(record.bullets, []);
      if (!heading) return null;
      return { heading, ...(content ? { content } : {}), ...(bullets.length ? { bullets } : {}) };
    })
    .filter((item): item is OutputSection => Boolean(item));
  return sections.length ? sections.slice(0, 8) : fallback;
}

function fallbackOutput({
  agent,
  inputs,
  template,
  missingInputs,
  model,
  fallbackUsed,
}: {
  agent: MarketplaceAgent;
  inputs: Record<string, string>;
  template: PromptTemplate;
  missingInputs: string[];
  model: string;
  fallbackUsed: boolean;
}): BlizzwayCompanionStructuredOutput {
  const goal = inputs.goal || inputs.currentStatus || `your ${template.title.toLowerCase()} goal`;
  const expectedOutput = asStringArray(agent.expectedOutput);
  const safetyNote = safetyNoteForTemplate(template);
  const actionSteps = [
    `Clarify the exact target for ${goal}.`,
    `Collect the strongest proof points before using ${agent.name}.`,
    "Save this guidance to your BDP or pathway after review.",
  ];

  return {
    title: `${agent.name} guidance`,
    summary: `${agent.name} prepared a structured guidance plan for ${goal}.`,
    sections: [
      {
        heading: template.title,
        content: template.focus,
        bullets: template.outputInstructions,
      },
      {
        heading: "Input review",
        bullets: Object.entries(inputs).map(([key, value]) => `${key}: ${value}`).slice(0, 5),
      },
    ],
    actionSteps,
    warnings: [safetyNote],
    recommendedNextActions: ["Review with NEXA", "Update your BDP", "Add one action to My Pathway"],
    bdpImpact: "This output can sharpen your BDP narrative, proof points, and readiness signals.",
    pathwayImpact: "This output creates the next practical pathway action without changing your existing progress.",
    nexaNote: "NEXA recommends treating this as a draft and improving it with real evidence before high-stakes use.",
    missingInputs,
    expectedOutput,
    safetyNote,
    nextActions: actionSteps,
    checklist: ["Current status captured", "Immediate blocker identified", "Next pathway action drafted", "Safety note attached"],
    provider: fallbackUsed ? "rule_based" : "openai",
    model,
    promptTemplateKey: template.key,
    generatedAt: new Date().toISOString(),
    outputVersion: OUTPUT_VERSION,
    fallbackUsed,
  };
}

function parseJsonObject(text: string) {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("AI_JSON_PARSE_FAILED");
    return JSON.parse(match[0]) as Record<string, unknown>;
  }
}

function normalizeAiOutput(
  raw: Record<string, unknown>,
  fallback: BlizzwayCompanionStructuredOutput,
): BlizzwayCompanionStructuredOutput {
  const safetyWarnings = normalizeStringArray(raw.warnings, fallback.warnings);
  const actionSteps = normalizeStringArray(raw.actionSteps, fallback.actionSteps);
  const recommendedNextActions = normalizeStringArray(raw.recommendedNextActions, fallback.recommendedNextActions);
  const sections = normalizeSections(raw.sections, fallback.sections);

  return {
    ...fallback,
    title: cleanText(raw.title) || fallback.title,
    summary: cleanText(raw.summary) || fallback.summary,
    sections,
    actionSteps,
    warnings: safetyWarnings.length ? safetyWarnings : fallback.warnings,
    recommendedNextActions,
    bdpImpact: cleanText(raw.bdpImpact) || fallback.bdpImpact,
    pathwayImpact: cleanText(raw.pathwayImpact) || fallback.pathwayImpact,
    nexaNote: cleanText(raw.nexaNote) || fallback.nexaNote,
    nextActions: actionSteps,
    checklist: sections.flatMap((section) => section.bullets ?? []).slice(0, 8),
    provider: "openai",
    fallbackUsed: false,
  };
}

function buildPrompt(agent: MarketplaceAgent, template: PromptTemplate, inputs: Record<string, string>, missingInputs: string[]) {
  return [
    `Companion: ${agent.name}`,
    `Template: ${template.key}`,
    `Focus: ${template.focus}`,
    `Expected output: ${template.outputInstructions.join("; ")}`,
    `User inputs: ${JSON.stringify(inputs)}`,
    `Missing/weak input signals to mention gently: ${missingInputs.join(", ") || "none"}`,
    "Return only a JSON object with keys: title, summary, sections, actionSteps, warnings, recommendedNextActions, bdpImpact, pathwayImpact, nexaNote.",
    "sections must be an array of objects with heading, content, and bullets.",
    "Keep it career, learning, admissions, migration, language, or personal growth guidance only.",
    "Never guarantee jobs, admissions, scholarships, visas, income, legal, medical, or financial outcomes.",
    "If admissions, visa, scholarship, or migration topics appear, clearly say guidance is advisory and must be checked against official sources or qualified experts.",
  ].join("\n");
}

export async function generateBlizzwayCompanionOutput({
  agent,
  inputs,
}: {
  agent: MarketplaceAgent;
  inputs: Record<string, unknown>;
}) {
  const sanitizedInputs = sanitizeCompanionInputs(inputs);
  if (Object.keys(sanitizedInputs).length === 0) {
    sanitizedInputs.goal = "Get clearer Blizzway guidance";
  }

  const template = templates[templateKeyForAgent(agent)] ?? templates.general_companion;
  const missingInputs = missingInputsForTemplate(template, sanitizedInputs);
  const model = process.env.BLIZZWAY_AI_MODEL || DEFAULT_MODEL;
  const fallback = fallbackOutput({
    agent,
    inputs: sanitizedInputs,
    template,
    missingInputs,
    model,
    fallbackUsed: true,
  });

  if (!process.env.OPENAI_API_KEY) {
    console.info("[blizzway:ai-run:fallback]", {
      companionSlug: agent.slug,
      promptTemplateKey: template.key,
      reason: "OPENAI_API_KEY_NOT_CONFIGURED",
    });
    return { output: fallback, sanitizedInputs };
  }

  try {
    // Rate-limit readiness: wire this call through the shared BGOS rate limiter
    // before public launch traffic grows beyond the controlled beta cohort.
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are NEXA for Blizzway. Produce safe, structured, practical career/admissions guidance. Never expose secrets. Never guarantee outcomes.",
        },
        { role: "user", content: buildPrompt(agent, template, sanitizedInputs, missingInputs) },
      ],
    });
    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("AI_EMPTY_OUTPUT");

    const output = normalizeAiOutput(
      parseJsonObject(content),
      fallbackOutput({ agent, inputs: sanitizedInputs, template, missingInputs, model, fallbackUsed: false }),
    );
    console.info("[blizzway:ai-run:success]", {
      companionSlug: agent.slug,
      promptTemplateKey: template.key,
      model,
      outputVersion: OUTPUT_VERSION,
    });
    return { output, sanitizedInputs };
  } catch (error) {
    console.error("[blizzway:ai-run:fallback]", {
      companionSlug: agent.slug,
      promptTemplateKey: template.key,
      reason: error instanceof Error ? error.message : "UNKNOWN_AI_ERROR",
    });
    return { output: fallback, sanitizedInputs };
  }
}
