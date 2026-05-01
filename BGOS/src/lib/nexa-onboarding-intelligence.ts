import OpenAI from "openai";

let openai: OpenAI | null = null;

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  openai ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai;
}

type CompletenessCheck = {
  score: number;
  missing: string[];
  flags: string[];
};

type SessionCheck = {
  label: string;
  status: "ok" | "missing" | "warning";
  message: string;
};

type EmployeeInput = {
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  reportsTo?: string;
  operatingProcedures?: string;
  assignedPipelines?: unknown[];
  decisionAuthority?: unknown[];
};

type PipelineInput = {
  stages?: unknown[];
};

type OnboardingSessionInput = {
  companyData?: {
    name?: string;
    industry?: string;
    [key: string]: unknown;
  };
  employeeData?: unknown[];
  pipelineData?: unknown[];
  operatingRules?: unknown[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function parseJsonArray<T>(value: string | null | undefined, fallback: T[]): T[] {
  if (!value) return fallback;

  try {
    const parsed = JSON.parse(value.replace(/```json|```/g, "").trim());
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function parseJsonObject<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;

  try {
    const parsed = JSON.parse(value.replace(/```json|```/g, "").trim());
    return parsed && typeof parsed === "object" ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

async function completeJson(prompt: string, maxTokens: number) {
  const client = getOpenAIClient();

  if (!client) {
    return null;
  }

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0]?.message?.content ?? null;
}

export function checkEmployeeCompleteness(employee: EmployeeInput): CompletenessCheck {
  const missing: string[] = [];
  const flags: string[] = [];
  let score = 100;

  if (!employee.name) {
    missing.push("Full name");
    score -= 20;
  }
  if (!employee.title) {
    missing.push("Job title");
    score -= 15;
  }
  if (!employee.email) {
    missing.push("Email address");
    score -= 15;
  }
  if (
    !employee.reportsTo &&
    employee.title !== "Managing Partner" &&
    employee.title !== "Owner"
  ) {
    missing.push("Reporting line");
    score -= 15;
  }
  if (!employee.operatingProcedures || employee.operatingProcedures.length < 50) {
    flags.push("Operating procedures need more detail");
    score -= 10;
  }
  if (!employee.phone) {
    flags.push("WhatsApp number missing - needed for NEXA briefings");
    score -= 5;
  }
  if (!employee.assignedPipelines || employee.assignedPipelines.length === 0) {
    flags.push("No pipelines assigned");
    score -= 10;
  }
  if (!employee.decisionAuthority || employee.decisionAuthority.length === 0) {
    flags.push("Decision authority not defined");
    score -= 10;
  }

  return { score: Math.max(0, score), missing, flags };
}

export function checkSessionCompleteness(session: OnboardingSessionInput): {
  score: number;
  checks: SessionCheck[];
  canSubmit: boolean;
} {
  const checks: SessionCheck[] = [];

  if (session.companyData?.name) {
    checks.push({
      label: "Company name",
      status: "ok",
      message: session.companyData.name,
    });
  } else {
    checks.push({ label: "Company name", status: "missing", message: "Required" });
  }

  if (session.companyData?.industry) {
    checks.push({
      label: "Industry",
      status: "ok",
      message: session.companyData.industry,
    });
  } else {
    checks.push({ label: "Industry", status: "missing", message: "Required" });
  }

  const employees = (session.employeeData || []).filter(isRecord) as EmployeeInput[];
  if (employees.length > 0) {
    checks.push({
      label: "Employees",
      status: "ok",
      message: `${employees.length} employees added`,
    });
    const incompleteEmployees = employees.filter(
      (employee) => checkEmployeeCompleteness(employee).score < 70,
    );
    if (incompleteEmployees.length > 0) {
      checks.push({
        label: "Employee completeness",
        status: "warning",
        message: `${incompleteEmployees.length} employees need more details`,
      });
    }
  } else {
    checks.push({
      label: "Employees",
      status: "missing",
      message: "No employees added yet",
    });
  }

  const pipelines = (session.pipelineData || []).filter(isRecord) as PipelineInput[];
  if (pipelines.length > 0) {
    const incompletePipelines = pipelines.filter(
      (pipeline) => !pipeline.stages || pipeline.stages.length < 3,
    );
    if (incompletePipelines.length > 0) {
      checks.push({
        label: "Pipeline stages",
        status: "warning",
        message: `${incompletePipelines.length} pipelines need stage details`,
      });
    } else {
      checks.push({
        label: "Pipelines",
        status: "ok",
        message: `${pipelines.length} pipelines configured`,
      });
    }
  } else {
    checks.push({
      label: "Pipelines",
      status: "missing",
      message: "No pipelines defined",
    });
  }

  const operatingRules = session.operatingRules ?? [];
  if (operatingRules.length > 0) {
    checks.push({
      label: "Operating rules",
      status: "ok",
      message: `${operatingRules.length} rules defined`,
    });
  } else {
    checks.push({
      label: "Operating rules",
      status: "warning",
      message: "No operating rules - recommended",
    });
  }

  const missingCount = checks.filter((check) => check.status === "missing").length;
  const totalScore = Math.round(
    (checks.filter((check) => check.status === "ok").length / checks.length) * 100,
  );
  const canSubmit = missingCount === 0 && totalScore >= 80;

  return { score: totalScore, checks, canSubmit };
}

export async function generateNexaGapQuestions(
  session: OnboardingSessionInput,
  businessType: string,
): Promise<string[]> {
  const employees = session.employeeData || [];
  const pipelines = session.pipelineData || [];

  const prompt = `You are NEXA, an intelligent business analyst. Analyse this business onboarding data and identify the most important missing information.

Business: ${session.companyData?.name} - ${businessType}
Employees: ${JSON.stringify(employees, null, 2)}
Pipelines: ${JSON.stringify(pipelines, null, 2)}
Operating rules: ${JSON.stringify(session.operatingRules, null, 2)}

Generate up to 5 specific, intelligent questions to fill critical gaps. Focus on:
1. Missing reporting lines
2. Unclear decision authority
3. Pipeline stages that need more detail
4. Roles that seem missing based on business type
5. Operating procedures that are vague

Return only a JSON array of question strings. No other text. Example:
["Who does Priya report to?", "What happens after a site survey fails?"]`;

  const text = await completeJson(prompt, 500);
  return parseJsonArray<string>(text, []);
}

export async function generateNexaSuggestions(
  session: OnboardingSessionInput,
): Promise<Array<{ type: string; suggestion: string; reason: string }>> {
  const prompt = `You are NEXA, an intelligent business analyst for Indian SMEs. Analyse this business and suggest improvements to their workspace setup.

Company: ${session.companyData?.name}
Industry: ${session.companyData?.industry}
Employees: ${JSON.stringify(session.employeeData, null, 2)}
Pipelines: ${JSON.stringify(session.pipelineData, null, 2)}

Generate up to 4 specific suggestions for roles, pipelines, or automations they probably need but have not mentioned. Base suggestions on typical Indian ${session.companyData?.industry} businesses.

Return only a JSON array. Each object has: type (role/pipeline/automation), suggestion (what to add), reason (why it would help - one sentence, specific to their business).

Example: [{"type":"role","suggestion":"Add an Accounts Executive role","reason":"Focus Point handles multiple product payments and needs someone tracking collections separately"}]

No other text.`;

  const text = await completeJson(prompt, 600);
  return parseJsonArray<{ type: string; suggestion: string; reason: string }>(
    text,
    [],
  );
}

export async function generateOnboardingSummary(session: OnboardingSessionInput): Promise<{
  readable: string;
  structured: unknown;
  recommendedPlan: string;
  planReason: string;
  buildComplexity: string;
}> {
  const prompt = `You are NEXA. Generate a complete onboarding summary for this business that will be used by an SDE to build their custom BGOS workspace.

Company Data: ${JSON.stringify(session.companyData, null, 2)}
Employees: ${JSON.stringify(session.employeeData, null, 2)}
Pipelines: ${JSON.stringify(session.pipelineData, null, 2)}
Operating Rules: ${JSON.stringify(session.operatingRules, null, 2)}

Return a JSON object with these exact fields:
{
  "readable": "A clean human-readable summary in this format:
BGOS ONBOARDING SUMMARY
Client: [company name]
Industry: [industry]
Total employees: [count]

TEAM STRUCTURE
[list each employee with name, title, email, reports to, key responsibilities]

PIPELINES
[list each pipeline with stages]

OPERATING RULES
[list key rules]

RECOMMENDED PLAN: [plan name and price]
REASON: [one clear reason]
BUILD COMPLEXITY: [Simple/Medium/Complex]",

  "structured": {
    "company": { "name": "", "industry": "", "location": "", "employeeCount": 0 },
    "employees": [{ "name": "", "title": "", "email": "", "phone": "", "reportsTo": "", "systemRole": "BDM/SDE/BOSS", "assignedPipelines": [], "operatingProcedures": "", "dailyTasks": [], "decisionAuthority": [] }],
    "pipelines": [{ "name": "", "productName": "", "stages": [], "visibleTo": [], "slaDays": {} }],
    "operatingRules": [],
    "automations": [{ "trigger": "", "condition": "", "action": "" }]
  },
  "recommendedPlan": "GROWTH/SCALE/ENTERPRISE",
  "planReason": "one clear sentence",
  "buildComplexity": "Simple/Medium/Complex"
}

No other text outside the JSON.`;

  const text = await completeJson(prompt, 2000);
  return parseJsonObject(text, {
    readable: "Summary generation failed. Please try again.",
    structured: {},
    recommendedPlan: "GROWTH",
    planReason: "Default recommendation",
    buildComplexity: "Medium",
  });
}
