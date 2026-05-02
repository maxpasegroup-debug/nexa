import OpenAI from "openai";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type JsonRecord = Record<string, unknown>;

type EngineEmployee = {
  id?: string;
  fullName?: string | null;
  name?: string | null;
  title?: string | null;
  email?: string | null;
  phone?: string | null;
  reportsTo?: string | null;
  bgosRole?: string | null;
  systemRole?: string | null;
  assignedPipelines?: unknown;
  operatingProcedures?: string | null;
  decisionAuthority?: unknown;
};

type EnginePipeline = {
  id?: string;
  name?: string | null;
  productName?: string | null;
  stages?: unknown;
  slaRules?: unknown;
  slaDays?: unknown;
  visibleTo?: unknown;
  color?: string | null;
};

type EngineSession = {
  id?: string;
  clientId?: string | null;
  companyData?: unknown;
  employees?: EngineEmployee[];
  pipelines?: EnginePipeline[];
  operatingRules?: unknown;
  challenges?: unknown;
  nexaConfig?: unknown;
  bdmNotes?: string | null;
  selectedPlan?: string | null;
  nexaMessages?: unknown;
  lead?: { company?: string | null; name?: string | null } | null;
  bdm?: { name?: string | null } | null;
};

export type CompletenessResult = {
  score: number;
  breakdown: Record<string, number>;
  blocked: string | null;
  canSubmit: boolean;
  missing: string[];
  warnings: string[];
};

export const SCORING = {
  company: { required: true, points: 15 },
  employeeCount: { required: true, points: 10 },
  employeeEmails: { required: true, points: 20 },
  reportingLines: { required: true, points: 15 },
  procedures: { required: true, points: 15 },
  pipelines: { required: true, points: 15 },
  rules: { required: false, points: 5 },
  challenge: { required: true, points: 5 },
} as const;

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function employeeName(employee: EngineEmployee) {
  return employee.fullName || employee.name || "unknown";
}

export function normalizeEmployee(employee: EngineEmployee) {
  const fullName = employeeName(employee);
  const bgosRole = employee.bgosRole || employee.systemRole || "Sales";

  return {
    id: employee.id,
    fullName,
    name: fullName,
    title: employee.title || "Team member",
    email: employee.email || "",
    phone: employee.phone || undefined,
    reportsTo: employee.reportsTo || undefined,
    bgosRole,
    systemRole: bgosRole,
    assignedPipelines: asArray<string>(employee.assignedPipelines),
    operatingProcedures: employee.operatingProcedures || undefined,
    decisionAuthority: Array.isArray(employee.decisionAuthority)
      ? employee.decisionAuthority
      : asString(employee.decisionAuthority)
        ? [asString(employee.decisionAuthority)]
        : [],
  };
}

export function normalizePipeline(pipeline: EnginePipeline) {
  return {
    id: pipeline.id,
    name: pipeline.name || pipeline.productName || "Business Pipeline",
    productName: pipeline.productName || pipeline.name || "Core product",
    stages: asArray<string>(pipeline.stages),
    slaRules: asRecord(pipeline.slaRules ?? pipeline.slaDays),
    visibleTo: asArray<string>(pipeline.visibleTo),
    color: pipeline.color || "#7C6FFF",
  };
}

export function calculateCompleteness(session: EngineSession): CompletenessResult {
  const companyData = asRecord(session.companyData);
  const employees = session.employees || [];
  const pipelines = session.pipelines || [];
  const missing: string[] = [];
  const warnings: string[] = [];
  const breakdown: Record<string, number> = {};

  const hasCompany =
    Boolean(companyData.name) &&
    Boolean(companyData.industry) &&
    Boolean(companyData.location) &&
    Boolean(companyData.employeeCount);
  breakdown.company = hasCompany ? 15 : companyData.name ? 8 : 0;
  if (!hasCompany) missing.push("Complete company details");

  const expectedCount = Number(companyData.employeeCount || 0);
  const actualCount = employees.length;
  if (expectedCount === 0) {
    breakdown.employeeCount = 0;
    missing.push("Total employee count");
  } else if (actualCount >= expectedCount) {
    breakdown.employeeCount = 10;
  } else {
    breakdown.employeeCount = Math.max(0, 10 - (expectedCount - actualCount) * 2);
    missing.push(`${expectedCount - actualCount} more employees needed`);
  }

  const missingEmails = employees.filter((employee) => !employee.email);
  if (missingEmails.length > 0) {
    breakdown.employeeEmails = Math.max(0, 20 - missingEmails.length * 4);
    missing.push(
      `Email missing for: ${missingEmails.map((employee) => employeeName(employee)).join(", ")}`,
    );
  } else {
    breakdown.employeeEmails = employees.length > 0 ? 20 : 0;
  }

  const missingReports = employees.filter(
    (employee) =>
      !employee.reportsTo &&
      (employee.bgosRole || employee.systemRole || "").toUpperCase() !== "BOSS",
  );
  if (missingReports.length > 0) {
    breakdown.reportingLines = Math.max(0, 15 - missingReports.length * 3);
    missing.push(
      `Reporting line missing for: ${missingReports
        .map((employee) => employeeName(employee))
        .join(", ")}`,
    );
  } else {
    breakdown.reportingLines = employees.length > 0 ? 15 : 0;
  }

  const vagueProcs = employees.filter(
    (employee) =>
      !employee.operatingProcedures || employee.operatingProcedures.length < 30,
  );
  breakdown.procedures = Math.max(0, 15 - vagueProcs.length * 2);
  if (vagueProcs.length > 0) {
    warnings.push(
      `Operating procedures too brief for: ${vagueProcs
        .map((employee) => employeeName(employee))
        .join(", ")}`,
    );
  }

  const validPipelines = pipelines.filter(
    (pipeline) => asArray(pipeline.stages).length >= 3,
  );
  if (validPipelines.length === 0) {
    breakdown.pipelines = 0;
    missing.push("At least one pipeline with 3+ stages required");
  } else {
    breakdown.pipelines = Math.min(15, 10 + (validPipelines.length - 1) * 5);
  }

  const rules = asArray(session.operatingRules);
  breakdown.rules = rules.length >= 2 ? 5 : rules.length === 1 ? 3 : 0;
  if (rules.length === 0) warnings.push("No operating rules defined");

  const challenges = asRecord(session.challenges);
  const primaryChallenge = asString(challenges.primary);
  const hasChallenges = primaryChallenge.length > 10;
  breakdown.challenge = hasChallenges ? 5 : 0;
  if (!hasChallenges) missing.push("Primary challenge not described");

  const score = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
  const blocked = missing.length > 0 ? missing.join(" · ") : null;
  const canSubmit = score >= 80 && missing.length === 0;

  return { score, breakdown, blocked, canSubmit, missing, warnings };
}

export async function generateNexaResponse(
  session: EngineSession,
  userMessage: string,
  currentStep: string,
): Promise<{
  response: string;
  nextStep: string;
  updatedData: JsonRecord;
  newFlags: string[];
  suggestions: string[];
}> {
  const companyData = asRecord(session.companyData);
  const employees = session.employees || [];
  const pipelines = session.pipelines || [];
  const { score, missing, warnings } = calculateCompleteness(session);

  const systemPrompt = `You are NEXA, an intelligent AI business analyst conducting a structured onboarding session for BGOS.

You are building a custom business management workspace for: ${companyData.name || "this business"}
Industry: ${companyData.industry || "unknown"}
Location: ${companyData.location || "unknown"}
Expected employees: ${companyData.employeeCount || "unknown"}
Employees collected so far: ${employees.length}
Pipelines collected: ${pipelines.length}
Current completeness score: ${score}/100

Current step: ${currentStep}
Missing required data: ${missing.join(", ") || "none"}
Warnings: ${warnings.join(", ") || "none"}

EXISTING DATA:
Employees: ${JSON.stringify(employees.map((employee) => ({ name: employeeName(employee), title: employee.title, email: employee.email, reportsTo: employee.reportsTo })))}
Pipelines: ${JSON.stringify(pipelines.map((pipeline) => ({ name: pipeline.name, stages: pipeline.stages })))}

YOUR RULES:
1. Ask ONE question at a time. Never ask multiple questions in one message.
2. Always acknowledge what you just received before asking the next question.
3. When you detect a gap, ask about it immediately, do not wait.
4. Use the person's actual name and company name in your messages.
5. Be conversational, not robotic. Sound like a smart consultant.
6. When all required employee data is collected, suggest industry-specific additions the BDM might have missed.
7. Never say "as an AI" or "I am an AI". You are NEXA, the business AI CEO.
8. Use confirmed/gap wording clearly.
9. Keep responses under 100 words unless showing a summary.

CURRENT STEP FOCUS: ${currentStep}
- company: collect company name, industry, location, employee count, products/services
- employees: go through each employee one by one: name, title, email, phone, reports-to, role, procedures
- pipelines: get all pipeline stages for each product
- rules: collect approval rules, follow-up rules, reporting rules
- review: show completeness score, fill remaining gaps, suggest improvements

Return only valid JSON:
{
  "message": "your natural response to the BDM",
  "extractedData": { "company": {}, "employee": {}, "pipeline": {}, "rules": [], "challenges": {}, "nexaConfig": {} },
  "nextStep": "company|employees|pipelines|rules|review",
  "flags": ["any gaps or issues detected"],
  "suggestions": ["any smart suggestions based on industry knowledge"]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 600,
      messages: [
        { role: "system", content: systemPrompt },
        ...asArray<{ role?: string; content?: string }>(session.nexaMessages)
          .slice(-10)
          .filter((message) => message.role === "user" || message.role === "assistant")
          .map((message) => ({
            role: message.role as "user" | "assistant",
            content: message.content || "",
          })),
        { role: "user", content: userMessage },
      ],
    });

    const text = completion.choices[0]?.message.content || "{}";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim()) as JsonRecord;

    return {
      response:
        asString(parsed.message) || "I did not understand that. Could you rephrase?",
      nextStep: asString(parsed.nextStep) || currentStep,
      updatedData: asRecord(parsed.extractedData),
      newFlags: asArray<string>(parsed.flags),
      suggestions: asArray<string>(parsed.suggestions),
    };
  } catch (error) {
    console.error("NEXA engine error:", error);
    return {
      response: "I had a brief issue. Could you repeat that?",
      nextStep: currentStep,
      updatedData: {},
      newFlags: [],
      suggestions: [],
    };
  }
}

export async function generateFinalSummary(sessionId: string): Promise<{
  readable: string;
  json: Prisma.InputJsonValue;
  score: number;
}> {
  const session = await prisma.onboardingSession.findUnique({
    where: { id: sessionId },
    include: {
      employees: true,
      pipelines: true,
      lead: true,
      bdm: { select: { name: true } },
    },
  });

  if (!session) throw new Error("Session not found");

  const { score } = calculateCompleteness(session);
  const today = new Date().toLocaleDateString("en-IN", { dateStyle: "medium" });

  const prompt = `Generate a complete professional onboarding summary for BGOS from this data.

Client ID: ${session.clientId || "pending"}
Company: ${JSON.stringify(session.companyData)}
Employees: ${JSON.stringify(session.employees)}
Pipelines: ${JSON.stringify(session.pipelines)}
Rules: ${JSON.stringify(session.operatingRules)}
Challenges: ${JSON.stringify(session.challenges)}
NEXA config: ${JSON.stringify(session.nexaConfig)}
BDM: ${session.bdm?.name || "BDM"}
BDM notes: ${session.bdmNotes || "none"}
Plan: ${session.selectedPlan || "GROWTH"}
Session date: ${today}
NEXA score: ${score}/100

Return ONLY a JSON object with these exact fields:
{
  "readable": "The complete formatted text summary using the requested CLIENT ONBOARDING SUMMARY format.",
  "structured": {
    "clientId": "",
    "company": { "name": "", "industry": "", "location": "", "employeeCount": 0, "products": [] },
    "employees": [{ "name": "", "title": "", "email": "", "phone": "", "reportsTo": "", "bgosRole": "", "pipelines": [], "procedures": "", "decisionAuthority": "" }],
    "pipelines": [{ "name": "", "stages": [], "slaRules": {}, "visibleTo": [], "color": "" }],
    "operatingRules": [],
    "challenges": { "primary": "", "secondary": "" },
    "nexaConfig": { "personality": "", "language": "", "welcomeMessage": "" },
    "plan": "",
    "bdmNotes": ""
  }
}
No other text outside the JSON.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 3000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = completion.choices[0]?.message.content || "{}";
  const parsed = JSON.parse(text.replace(/```json|```/g, "").trim()) as JsonRecord;

  return {
    readable: asString(parsed.readable),
    json: asRecord(parsed.structured) as Prisma.InputJsonValue,
    score,
  };
}
