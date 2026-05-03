import OpenAI from "openai";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

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
  company: { required: true, points: 10 },
  team: { required: true, points: 15 },
  workflows: { required: true, points: 15 },
  workspaceModules: { required: true, points: 15 },
  permissions: { required: true, points: 10 },
  automations: { required: true, points: 10 },
  reports: { required: true, points: 10 },
  integrations: { required: false, points: 5 },
  acceptanceCriteria: { required: true, points: 5 },
  outOfScope: { required: true, points: 5 },
} as const;

const BUILD_REQUIREMENT_FIELDS = [
  "modules",
  "dataModels",
  "permissions",
  "automations",
  "notifications",
  "reports",
  "integrations",
  "existingData",
  "dashboardKpis",
  "templates",
  "paymentRules",
  "acceptanceCriteria",
  "outOfScope",
] as const;

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function hasDetailedText(value: unknown, minLength = 18): boolean {
  if (typeof value === "string") return value.trim().length >= minLength;
  if (typeof value === "number" || typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.some((item) => hasDetailedText(item, minLength));
  if (value && typeof value === "object") {
    return Object.values(value as JsonRecord).some((item) => hasDetailedText(item, minLength));
  }
  return false;
}

function hasDetailedArray(value: unknown, minItems = 1, minLength = 12) {
  const items = asArray(value);
  return items.length >= minItems && items.every((item) => hasDetailedText(item, minLength));
}

function hasAnyDetailedField(value: unknown, fields: string[], minLength = 8) {
  const record = asRecord(value);
  return fields.some((field) => hasDetailedText(record[field], minLength));
}

function employeeName(employee: EngineEmployee) {
  return employee.fullName || employee.name || "unknown";
}

function buildRequirementsFrom(session: EngineSession) {
  const nexaConfig = asRecord(session.nexaConfig);
  const nested = asRecord(
    nexaConfig.buildRequirements ?? nexaConfig.buildSpec ?? nexaConfig.workspaceRequirements,
  );

  return BUILD_REQUIREMENT_FIELDS.reduce<JsonRecord>((acc, field) => {
    acc[field] = nested[field] ?? nexaConfig[field];
    return acc;
  }, {});
}

function formatList(value: unknown, fallback = "Not captured") {
  const items = asArray(value);
  if (!items.length) return fallback;
  return items
    .map((item, index) => {
      if (typeof item === "string") return `${index + 1}. ${item}`;
      return `${index + 1}. ${JSON.stringify(item)}`;
    })
    .join("\n");
}

function formatKeyValues(value: unknown, fallback = "Not captured") {
  const record = asRecord(value);
  const entries = Object.entries(record).filter(([, item]) => item !== undefined && item !== null && item !== "");
  if (!entries.length) return fallback;
  return entries
    .map(([key, item]) => {
      const formatted = typeof item === "string" ? item : JSON.stringify(item);
      return `${key}: ${formatted}`;
    })
    .join("\n");
}

function formatEmployees(employees: EngineEmployee[]) {
  if (!employees.length) return "No users captured.";
  return employees
    .map((employee, index) =>
      [
        `${index + 1}. ${employeeName(employee)} - ${employee.title || "Role pending"}`,
        `   Email: ${employee.email || "Missing"}`,
        `   Phone: ${employee.phone || "Not provided"}`,
        `   Reports to: ${employee.reportsTo || "Top level / owner"}`,
        `   BGOS role: ${employee.bgosRole || employee.systemRole || "Sales"}`,
        `   Pipelines/modules: ${formatList(employee.assignedPipelines, "None assigned").replace(/\n/g, "; ")}`,
        `   Daily work / SOP: ${employee.operatingProcedures || "Missing"}`,
        `   Decisions allowed: ${formatList(employee.decisionAuthority, "Not specified").replace(/\n/g, "; ")}`,
      ].join("\n"),
    )
    .join("\n\n");
}

function formatPipelines(pipelines: EnginePipeline[]) {
  if (!pipelines.length) return "No workflows captured.";
  return pipelines
    .map((pipeline, index) =>
      [
        `${index + 1}. ${pipeline.name || pipeline.productName || "Business Pipeline"}`,
        `   Product/service: ${pipeline.productName || pipeline.name || "Core product"}`,
        `   Stages: ${formatList(pipeline.stages, "Missing stages").replace(/\n/g, "; ")}`,
        `   SLA rules: ${formatKeyValues(pipeline.slaRules ?? pipeline.slaDays, "Missing SLA rules").replace(/\n/g, "; ")}`,
        `   Visible to: ${formatList(pipeline.visibleTo, "Visibility missing").replace(/\n/g, "; ")}`,
      ].join("\n"),
    )
    .join("\n\n");
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
  const requirements = buildRequirementsFrom(session);
  const missing: string[] = [];
  const warnings: string[] = [];
  const breakdown: Record<string, number> = {};

  const hasCompany =
    Boolean(companyData.name) &&
    Boolean(companyData.industry) &&
    Boolean(companyData.location) &&
    Boolean(companyData.employeeCount) &&
    hasAnyDetailedField(companyData, ["products", "services", "targetCustomers", "businessModel"], 8);
  breakdown.company = hasCompany ? 10 : companyData.name ? 5 : 0;
  if (!hasCompany) missing.push("Complete company profile: industry, location, team size, products/services, target customers");

  const expectedCount = Number(companyData.employeeCount || 0);
  const requiredUserRecords = expectedCount > 0 ? Math.min(expectedCount, 8) : 0;
  const missingEmails = employees.filter((employee) => !employee.email);
  const missingReports = employees.filter(
    (employee) => !employee.reportsTo && (employee.bgosRole || employee.systemRole || "").toUpperCase() !== "BOSS",
  );
  const vagueProcedures = employees.filter(
    (employee) => !employee.operatingProcedures || employee.operatingProcedures.length < 40,
  );
  const teamDeductions = [
    expectedCount === 0,
    requiredUserRecords === 0 || employees.length < requiredUserRecords,
    missingEmails.length > 0,
    missingReports.length > 0,
    vagueProcedures.length > 0,
  ].filter(Boolean).length;
  breakdown.team = Math.max(0, 15 - teamDeductions * 3);
  if (expectedCount === 0) missing.push("Total employee count");
  if (requiredUserRecords === 0 || employees.length < requiredUserRecords) {
    missing.push(`Add key users and roles: ${Math.max(requiredUserRecords - employees.length, 1)} more needed`);
  }
  if (missingEmails.length) missing.push(`Email missing for: ${missingEmails.map(employeeName).join(", ")}`);
  if (missingReports.length) missing.push(`Reporting line missing for: ${missingReports.map(employeeName).join(", ")}`);
  if (vagueProcedures.length) missing.push(`Daily work/SOP too brief for: ${vagueProcedures.map(employeeName).join(", ")}`);

  const validPipelines = pipelines.filter((pipeline) => asArray(pipeline.stages).length >= 3);
  const missingPipelineDetails = validPipelines.filter(
    (pipeline) => !hasDetailedText(pipeline.slaRules ?? pipeline.slaDays, 4) || !asArray(pipeline.visibleTo).length,
  );
  breakdown.workflows = validPipelines.length ? (missingPipelineDetails.length ? 10 : 15) : 0;
  if (!validPipelines.length) missing.push("At least one workflow/pipeline with 3+ stages");
  if (missingPipelineDetails.length) missing.push("Pipeline SLA rules and visibility");

  const challenges = asRecord(session.challenges);
  if (!hasDetailedText(challenges.primary, 12)) missing.push("Primary business challenge");

  const hasModules = hasDetailedArray(requirements.modules, 1, 8);
  const hasDataModels = hasDetailedArray(requirements.dataModels, 1, 8);
  breakdown.workspaceModules = hasModules && hasDataModels ? 15 : hasModules ? 8 : 0;
  if (!hasModules) missing.push("Modules/screens the SDE must build");
  if (!hasDataModels) missing.push("Data fields, forms, and validations");

  const hasPermissions = hasDetailedArray(requirements.permissions, 1, 10);
  breakdown.permissions = hasPermissions ? 10 : 0;
  if (!hasPermissions) missing.push("Roles and permission matrix");

  const hasAutomations = hasDetailedArray(requirements.automations, 1, 10);
  const hasNotifications = hasDetailedArray(requirements.notifications, 1, 10);
  breakdown.automations = hasAutomations && hasNotifications ? 10 : hasAutomations || hasNotifications ? 5 : 0;
  if (!hasAutomations) missing.push("Automations, reminders, and escalation rules");
  if (!hasNotifications) missing.push("Notification channels and templates");

  const hasReports = hasDetailedArray(requirements.reports, 1, 10);
  const hasKpis = hasDetailedArray(requirements.dashboardKpis, 1, 6);
  breakdown.reports = hasReports && hasKpis ? 10 : hasReports ? 6 : 0;
  if (!hasReports) missing.push("Reports and dashboard views");
  if (!hasKpis) missing.push("Dashboard KPIs");

  const hasIntegrations = hasDetailedArray(requirements.integrations, 1, 5);
  breakdown.integrations = hasIntegrations ? 5 : 3;
  if (!hasIntegrations) warnings.push("No integrations captured; confirm 'none' if there are no tools to connect");

  const hasAcceptanceCriteria = hasDetailedArray(requirements.acceptanceCriteria, 3, 8);
  breakdown.acceptanceCriteria = hasAcceptanceCriteria ? 5 : 0;
  if (!hasAcceptanceCriteria) missing.push("At least 3 acceptance criteria for QA");

  const hasOutOfScope = hasDetailedArray(requirements.outOfScope, 1, 4);
  breakdown.outOfScope = hasOutOfScope ? 5 : 0;
  if (!hasOutOfScope) missing.push("Out-of-scope items or explicit 'none'");

  const score = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
  const blocked = missing.length ? missing.join(" | ") : null;
  const canSubmit = score >= 90 && missing.length === 0;

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
  const requirements = buildRequirementsFrom(session);
  const { score, missing, warnings } = calculateCompleteness(session);

  const systemPrompt = `You are NEXA, the BGOS onboarding analyst. Your job is to collect a complete implementation brief from the BDM so an SDE can paste the final summary into Claude and build the exact customer workspace without guessing.

Business: ${companyData.name || "unknown"}
Industry: ${companyData.industry || "unknown"}
Location: ${companyData.location || "unknown"}
Expected employees: ${companyData.employeeCount || "unknown"}
Employees collected: ${employees.length}
Workflows collected: ${pipelines.length}
Build readiness score: ${score}/100
Current step: ${currentStep}
Missing: ${missing.join(", ") || "none"}
Warnings: ${warnings.join(", ") || "none"}

COLLECTED USERS:
${JSON.stringify(employees.map((employee) => ({ name: employeeName(employee), title: employee.title, email: employee.email, reportsTo: employee.reportsTo, role: employee.bgosRole || employee.systemRole, procedures: employee.operatingProcedures })))}

COLLECTED WORKFLOWS:
${JSON.stringify(pipelines.map((pipeline) => ({ name: pipeline.name, stages: pipeline.stages, slaRules: pipeline.slaRules ?? pipeline.slaDays, visibleTo: pipeline.visibleTo })))}

COLLECTED BUILD REQUIREMENTS:
${JSON.stringify(requirements)}

BUILD READINESS CHECKLIST - every item must be specific:
1. Company profile: products/services, target customers, location, team size, business model.
2. Users: owner and key users, email, phone, role, reports-to, permissions, daily work/SOP.
3. Workflows: every pipeline/module workflow, stages, status rules, SLA, visibility.
4. Modules/screens: exact screens the SDE must add, fields, actions, tables, filters, drawers.
5. Data models: records, required fields, dropdown values, validations, sample examples.
6. Permissions: who can view/create/edit/delete/approve/export each module.
7. Automations: reminders, follow-ups, escalations, recurring tasks, triggers.
8. Notifications/templates: WhatsApp/email/SMS/in-app messages and recipients.
9. Reports/KPIs: dashboards, charts, list views, metrics, date filters.
10. Integrations/imports: existing tools, spreadsheets, WhatsApp, email, payment, accounting.
11. Acceptance criteria: at least 3 concrete checks the SDE can use to verify the build.
12. Out of scope: what the SDE should not build or touch.

CONVERSATION RULES:
1. Ask one question at a time.
2. Acknowledge the answer briefly before asking the next question.
3. If an answer is vague, ask a clarification before moving on.
4. Do not let the BDM finish until every missing item is resolved.
5. Prefer industry-specific follow-ups.
6. Keep each response under 120 words.
7. Never invent values. Store uncertain data as a flag or ask again.

STEP GUIDE:
- company: company profile and business context.
- employees: key users, access, reporting, SOPs.
- pipelines: workflows, stages, SLAs, visibility.
- requirements: modules, fields, automations, reports, integrations, templates.
- review: fill gaps, acceptance criteria, out-of-scope, final confirmation.

Return only valid JSON:
{
  "message": "natural response to the BDM",
  "extractedData": {
    "company": {},
    "employee": {},
    "pipeline": {},
    "rules": [],
    "challenges": {},
    "nexaConfig": {
      "buildRequirements": {
        "modules": [],
        "dataModels": [],
        "permissions": [],
        "automations": [],
        "notifications": [],
        "reports": [],
        "integrations": [],
        "existingData": [],
        "dashboardKpis": [],
        "templates": [],
        "paymentRules": [],
        "acceptanceCriteria": [],
        "outOfScope": []
      }
    }
  },
  "nextStep": "company|employees|pipelines|requirements|review",
  "flags": ["specific gaps or risks"],
  "suggestions": ["smart industry-specific suggestion"]
}`;

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      max_tokens: 800,
      messages: [
        { role: "system", content: systemPrompt },
        ...asArray<{ role?: string; content?: string }>(session.nexaMessages)
          .slice(-12)
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
      response: asString(parsed.message) || "I did not understand that. Could you rephrase?",
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

  const completeness = calculateCompleteness(session);
  const companyData = asRecord(session.companyData);
  const requirements = buildRequirementsFrom(session);
  const challenges = asRecord(session.challenges);
  const today = new Date().toLocaleDateString("en-IN", { dateStyle: "medium" });
  const companyName =
    asString(companyData.name) || session.lead?.company || session.lead?.name || "Client";
  const plan = session.selectedPlan || "GROWTH";
  const clientId = session.clientId || "pending";

  const employees = session.employees.map((employee) => ({
    name: employee.name || employee.fullName,
    title: employee.title,
    email: employee.email,
    phone: employee.phone,
    reportsTo: employee.reportsTo,
    bgosRole: employee.bgosRole,
    systemRole: employee.systemRole,
    pipelines: asArray(employee.assignedPipelines),
    procedures: employee.operatingProcedures,
    decisionAuthority: asArray(employee.decisionAuthority),
  }));

  const pipelines = session.pipelines.map((pipeline) => ({
    name: pipeline.name,
    productName: pipeline.productName,
    stages: asArray(pipeline.stages),
    slaRules: asRecord(pipeline.slaRules),
    visibleTo: asArray(pipeline.visibleTo),
    color: pipeline.color,
  }));

  const structured = {
    clientId,
    company: {
      name: companyName,
      industry: asString(companyData.industry),
      location: asString(companyData.location),
      employeeCount: Number(companyData.employeeCount || employees.length || 0),
      products: companyData.products ?? companyData.services ?? [],
      targetCustomers: companyData.targetCustomers ?? "",
      businessModel: companyData.businessModel ?? "",
    },
    employees,
    pipelines,
    operatingRules: asArray(session.operatingRules),
    challenges,
    buildRequirements: requirements,
    automations: asArray(requirements.automations),
    reports: asArray(requirements.reports),
    integrations: asArray(requirements.integrations),
    nexaConfig: {
      ...asRecord(session.nexaConfig),
      buildRequirements: requirements,
    },
    starterTasks: [
      `Review ${companyName} workspace modules`,
      "Confirm users, roles, and permissions",
      "Check workflows, automations, and reports",
      "Test acceptance criteria with sample records",
    ],
    customInsights: [
      `${companyName} workspace was generated from a NEXA build-ready onboarding brief.`,
      `Primary challenge: ${asString(challenges.primary, "Not captured")}`,
      `Plan: ${plan}`,
    ],
    plan,
    bdmNotes: session.bdmNotes || "",
    readiness: {
      score: completeness.score,
      canSubmit: completeness.canSubmit,
      missing: completeness.missing,
      warnings: completeness.warnings,
    },
  };

  const claudePrompt = [
    `You are building a BGOS customer workspace for ${companyName}.`,
    `Client ID: ${clientId}. Plan: ${plan}.`,
    "Use the implementation brief above as the source of truth.",
    "Build only the requested modules/screens, workflows, automations, reports, roles, and integrations.",
    "Do not touch unrelated routes or existing data.",
    "If anything is ambiguous, ask clarification before coding.",
    "Say GO when you understand the scope and are ready for the Codex build prompt.",
  ].join(" ");

  const readable = [
    "CLIENT WORKSPACE BUILD BRIEF",
    "============================================================",
    `Client ID: ${clientId}`,
    `Business: ${companyName}`,
    `Industry: ${asString(companyData.industry, "Not captured")}`,
    `Location: ${asString(companyData.location, "Not captured")}`,
    `Plan: ${plan}`,
    `BDM: ${session.bdm?.name || "BDM"}`,
    `Session date: ${today}`,
    `Build readiness: ${completeness.score}/100`,
    "",
    "BUSINESS CONTEXT",
    "------------------------------------------------------------",
    formatKeyValues(companyData),
    "",
    "PRIMARY BUSINESS CHALLENGE",
    "------------------------------------------------------------",
    formatKeyValues(challenges),
    "",
    "USERS, ROLES, REPORTING, AND SOP",
    "------------------------------------------------------------",
    formatEmployees(session.employees),
    "",
    "WORKFLOWS / PIPELINES",
    "------------------------------------------------------------",
    formatPipelines(session.pipelines),
    "",
    "MODULES / SCREENS TO BUILD",
    "------------------------------------------------------------",
    formatList(requirements.modules),
    "",
    "DATA MODELS, FIELDS, AND VALIDATIONS",
    "------------------------------------------------------------",
    formatList(requirements.dataModels),
    "",
    "PERMISSIONS MATRIX",
    "------------------------------------------------------------",
    formatList(requirements.permissions),
    "",
    "AUTOMATIONS, REMINDERS, AND ESCALATIONS",
    "------------------------------------------------------------",
    formatList(requirements.automations),
    "",
    "NOTIFICATIONS AND TEMPLATES",
    "------------------------------------------------------------",
    formatList(requirements.notifications),
    formatList(requirements.templates, ""),
    "",
    "REPORTS, DASHBOARDS, AND KPIS",
    "------------------------------------------------------------",
    formatList(requirements.reports),
    formatList(requirements.dashboardKpis, ""),
    "",
    "INTEGRATIONS / IMPORTS / EXISTING DATA",
    "------------------------------------------------------------",
    formatList(requirements.integrations),
    formatList(requirements.existingData, ""),
    "",
    "PAYMENT / BILLING RULES",
    "------------------------------------------------------------",
    formatList(requirements.paymentRules),
    "",
    "OPERATING RULES",
    "------------------------------------------------------------",
    formatList(session.operatingRules),
    "",
    "ACCEPTANCE CRITERIA FOR SDE QA",
    "------------------------------------------------------------",
    formatList(requirements.acceptanceCriteria),
    "",
    "OUT OF SCOPE / DO NOT BUILD",
    "------------------------------------------------------------",
    formatList(requirements.outOfScope),
    "",
    "BDM NOTES",
    "------------------------------------------------------------",
    session.bdmNotes || "No additional BDM notes.",
    "",
    "OPEN GAPS",
    "------------------------------------------------------------",
    completeness.missing.length ? formatList(completeness.missing) : "None. NEXA marked this brief build-ready.",
    "",
    "CLAUDE BUILD PROMPT",
    "------------------------------------------------------------",
    claudePrompt,
    "============================================================",
  ].join("\n");

  return {
    readable,
    json: structured as Prisma.InputJsonValue,
    score: completeness.score,
  };
}
