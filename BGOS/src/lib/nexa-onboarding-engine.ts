import OpenAI from "openai";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

type JsonRecord = Record<string, unknown>;
type ConfidenceScore = "low" | "medium" | "high";
type ExtractionSource = "explicit" | "inferred";

type ParsedField<T> = {
  value: T | null;
  confidence: ConfidenceScore;
  confidence_score: ConfidenceScore;
  source: ExtractionSource;
};

export type BusinessContext = {
  company_name: ParsedField<string>;
  business_type: ParsedField<string>;
  industry: ParsedField<string>;
  products_services: ParsedField<string[]>;
  target_customers: ParsedField<string[]>;
  team_size: ParsedField<number>;
  location: ParsedField<string>;
  lead_sources: ParsedField<string[]>;
  sales_process: ParsedField<string[]>;
  sales_flow: ParsedField<string[]>;
  follow_up_style: ParsedField<string>;
  roles: ParsedField<Record<string, string>>;
  roles_mapping: ParsedField<Record<string, string>>;
  pain_points: ParsedField<string[]>;
  problems_faced: ParsedField<string[]>;
};

export type CompanyProfile = {
  identity: JsonRecord;
  business: JsonRecord;
  sales: JsonRecord;
  team: JsonRecord;
  system: JsonRecord;
  confidence_map: JsonRecord;
  requirements: JsonRecord;
};

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

function confidenceRank(score: unknown) {
  if (score === "high") return 3;
  if (score === "medium") return 2;
  return 1;
}

function field<T>(
  value: T | null,
  confidence: ConfidenceScore,
  source: ExtractionSource = confidence === "high" ? "explicit" : "inferred",
): ParsedField<T> {
  const finalConfidence = value === null ? "low" : confidence;
  return {
    value,
    confidence: finalConfidence,
    confidence_score: finalConfidence,
    source: value === null ? "inferred" : source,
  };
}

function uniqueStrings(items: unknown[]) {
  return Array.from(
    new Set(
      items
        .flatMap((item) => (Array.isArray(item) ? item : [item]))
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function phraseList(input: string) {
  return uniqueStrings(
    input
      .replace(/\b(team|staff|employees?|members?|people)\s*(size)?\s*(is|of|:)?\s*\d+/gi, " ")
      .split(/[,/&+]| and /i)
      .map((item) => item.trim())
      .filter((item) => item.length > 2 && item.length < 50),
  );
}

function matchKnown(input: string, options: string[]) {
  const lower = input.toLowerCase();
  return options.filter((option) => lower.includes(option.toLowerCase()));
}

function guessBusinessType(input: string, products: string[]) {
  const lower = input.toLowerCase();
  if (/\b(service|services|maintenance|installation|repair|support)\b/i.test(lower)) {
    return field("service", "high", "explicit");
  }
  if (/\b(product|products|manufacturing|trading|distribution|retail)\b/i.test(lower)) {
    return field("product", "high", "explicit");
  }
  if (products.length > 1 || /\b(sales?\s*(and|&)\s*service|supply\s*(and|&)\s*installation)\b/i.test(lower)) {
    return field("hybrid", "medium", "inferred");
  }
  return field<string>(null, "low");
}

function guessIndustry(input: string, products: string[]) {
  const lower = input.toLowerCase();
  const known = [
    "solar",
    "cctv",
    "electrical",
    "construction",
    "real estate",
    "education",
    "healthcare",
    "retail",
    "manufacturing",
    "consulting",
    "service",
    "trading",
    "distribution",
    "software",
    "agency",
  ];
  const hits = known.filter((item) => lower.includes(item));
  if (hits.length) return field(hits.slice(0, 3).join(" and "), "medium", "inferred");
  if (products.length) return field(`${products[0]} business`, "low", "inferred");
  return field<string>(null, "low");
}

function inferTargetCustomers(input: string, businessType: string | null) {
  const explicit = matchKnown(input, [
    "homes",
    "home owners",
    "residential",
    "commercial",
    "businesses",
    "builders",
    "contractors",
    "dealers",
    "schools",
    "hospitals",
    "apartments",
    "offices",
    "retail shops",
  ]);
  if (explicit.length) return field(explicit, "high", "explicit");
  const lowerType = (businessType || "").toLowerCase();
  if (lowerType.includes("solar") || lowerType.includes("cctv") || lowerType.includes("electrical")) {
    return field(["residential customers", "commercial clients"], "low", "inferred");
  }
  return field<string[]>(null, "low");
}

function extractLocation(input: string) {
  const match = input.match(/\b(?:in|at|from|near)\s+([A-Z][A-Za-z .-]{2,40})(?:[,.]|$)/);
  if (match?.[1]) return field(match[1].trim(), "medium", "explicit");
  return field<string>(null, "low");
}

function extractCompanyName(input: string) {
  const match = input.match(/\b(?:company|business|firm|client)\s+(?:name\s+)?(?:is|:)?\s*([A-Z][A-Za-z0-9 &'().-]{2,60})/i);
  if (match?.[1]) return field(match[1].trim(), "high", "explicit");
  const possessive = input.match(/\b([A-Z][A-Za-z0-9 &'().-]{2,60})'?s\s+(?:business|company|firm)\b/);
  if (possessive?.[1]) return field(possessive[1].trim(), "medium", "inferred");
  return field<string>(null, "low");
}

function extractTeamSize(input: string) {
  const match =
    input.match(/\b(?:team|staff|employees?|members?|people)\s*(?:size)?\s*(?:is|of|:)?\s*(\d{1,4})\b/i) ||
    input.match(/\b(\d{1,4})\s*(?:people|members|staff|employees?|team)\b/i);
  return match?.[1] ? field(Number(match[1]), "high", "explicit") : field<number>(null, "low");
}

function extractRoles(input: string) {
  const roles: Record<string, string> = {};
  const lower = input.toLowerCase();
  if (lower.includes("owner") || lower.includes("boss")) roles.owner = "Business owner / final approver";
  if (lower.includes("sales") || lower.includes("bdm")) roles.sales = "Lead handling and follow-up";
  if (lower.includes("technician") || lower.includes("engineer")) roles.technical = "Installation/service execution";
  if (lower.includes("accounts") || lower.includes("payment")) roles.accounts = "Billing and collections";
  if (lower.includes("admin")) roles.admin = "Coordination and operations";
  return field(Object.keys(roles).length ? roles : null, Object.keys(roles).length > 1 ? "medium" : "low", "inferred");
}

function extractProblems(input: string) {
  const lower = input.toLowerCase();
  const problems: string[] = [];
  if (/(follow.?up|miss|forget|delay)/i.test(lower)) problems.push("follow-up leakage");
  if (/(payment|collection|due|pending amount)/i.test(lower)) problems.push("payment and collection tracking");
  if (/(task|work|assign|accountability|responsibility)/i.test(lower)) problems.push("task ownership and accountability");
  if (/(report|dashboard|visibility|track|monitor)/i.test(lower)) problems.push("management visibility");
  if (/(quotation|quote|estimate)/i.test(lower)) problems.push("quotation tracking");
  if (/(service|complaint|maintenance|amc)/i.test(lower)) problems.push("service and maintenance tracking");
  return field(problems.length ? problems : null, problems.length > 1 ? "medium" : "low", "inferred");
}

export function inputEngine(input: string) {
  return String(input ?? "").trim();
}

export function parseBusinessContext(input: string): BusinessContext {
  const safeInput = inputEngine(input);
  const leadSources = matchKnown(safeInput, [
    "WhatsApp",
    "Instagram",
    "Facebook",
    "website",
    "Google",
    "referral",
    "walk-in",
    "cold calling",
    "field visit",
    "IndiaMART",
  ]);
  const salesFlow = matchKnown(safeInput, [
    "new lead",
    "contacted",
    "follow up",
    "site visit",
    "quotation",
    "negotiation",
    "payment",
    "installation",
    "handover",
    "lost",
  ]);
  const followUp = matchKnown(safeInput, ["daily", "weekly", "monthly", "WhatsApp", "call", "email"]);
  const teamSize = extractTeamSize(safeInput);
  const obviousProducts = matchKnown(safeInput, [
    "solar",
    "CCTV",
    "electrical",
    "AMC",
    "maintenance",
    "installation",
    "quotation",
    "service",
    "consulting",
    "trading",
  ]);
  const products = obviousProducts.length ? obviousProducts : phraseList(safeInput);
  const businessType = guessBusinessType(safeInput, products);
  const industry = guessIndustry(safeInput, products);
  const roles = extractRoles(safeInput);
  const painPoints = extractProblems(safeInput);
  const parsedSalesProcess = field(salesFlow.length ? salesFlow : null, salesFlow.length > 2 ? "high" : "medium", salesFlow.length ? "explicit" : "inferred");

  return {
    company_name: extractCompanyName(safeInput),
    business_type: businessType,
    industry,
    products_services: field(products.length ? products : null, obviousProducts.length ? "medium" : "low", obviousProducts.length ? "explicit" : "inferred"),
    target_customers: inferTargetCustomers(safeInput, industry.value || businessType.value),
    team_size: teamSize,
    location: extractLocation(safeInput),
    lead_sources: field(leadSources.length ? leadSources : null, leadSources.length > 1 ? "high" : "medium", leadSources.length ? "explicit" : "inferred"),
    sales_process: parsedSalesProcess,
    sales_flow: parsedSalesProcess,
    follow_up_style: field(followUp.length ? followUp.join(" + ") : null, followUp.length > 1 ? "high" : "medium", followUp.length ? "explicit" : "inferred"),
    roles,
    roles_mapping: roles,
    pain_points: painPoints,
    problems_faced: painPoints,
  };
}

export const parseInput = parseBusinessContext;
export const interpretationEngine = parseBusinessContext;

function emptyProfile(): CompanyProfile {
  return {
    identity: {},
    business: {},
    sales: {},
    team: {},
    system: {},
    confidence_map: {},
    requirements: {},
  };
}

function getProfile(nexaConfig: unknown): CompanyProfile {
  const config = asRecord(nexaConfig);
  const profile = asRecord(config.company_profile);
  return {
    ...emptyProfile(),
    ...profile,
    identity: asRecord(profile.identity),
    business: asRecord(profile.business),
    sales: asRecord(profile.sales),
    team: asRecord(profile.team),
    system: asRecord(profile.system),
    confidence_map: asRecord(profile.confidence_map),
    requirements: asRecord(profile.requirements),
  };
}

function setProfileField(section: JsonRecord, key: string, incoming: ParsedField<unknown>) {
  if (incoming.value === null || incoming.value === undefined) return;
  const current = asRecord(section[key]);
  const currentValue = current.value;
  const currentConfidence = current.confidence_score;
  const nextValue =
    Array.isArray(currentValue) || Array.isArray(incoming.value)
      ? uniqueStrings([...(Array.isArray(currentValue) ? currentValue : []), incoming.value])
      : incoming.value;

  if (!currentValue || confidenceRank(incoming.confidence_score) >= confidenceRank(currentConfidence)) {
    section[key] = {
      value: nextValue,
      confidence: incoming.confidence,
      confidence_score: incoming.confidence_score,
      source: incoming.source,
      updatedAt: new Date().toISOString(),
    };
  }
}

function updateConfidenceMap(profile: CompanyProfile) {
  const confidenceMap: JsonRecord = {};
  for (const [sectionName, section] of Object.entries(profile)) {
    if (sectionName === "confidence_map") continue;
    for (const [key, item] of Object.entries(asRecord(section))) {
      const record = asRecord(item);
      if (record.value !== undefined) {
        confidenceMap[`${sectionName}.${key}`] = {
          confidence: record.confidence ?? record.confidence_score ?? "low",
          source: record.source ?? "inferred",
        };
      }
    }
  }
  profile.confidence_map = confidenceMap;
}

export function mergeBusinessContextIntoProfile(
  currentProfile: unknown,
  parsed: BusinessContext,
): CompanyProfile {
  const profile = {
    ...emptyProfile(),
    ...asRecord(currentProfile),
    identity: asRecord(asRecord(currentProfile).identity),
    business: asRecord(asRecord(currentProfile).business),
    sales: asRecord(asRecord(currentProfile).sales),
    team: asRecord(asRecord(currentProfile).team),
    system: asRecord(asRecord(currentProfile).system),
    confidence_map: asRecord(asRecord(currentProfile).confidence_map),
    requirements: asRecord(asRecord(currentProfile).requirements),
  };

  setProfileField(profile.identity, "company_name", parsed.company_name as ParsedField<unknown>);
  setProfileField(profile.identity, "location", parsed.location as ParsedField<unknown>);
  setProfileField(profile.business, "business_type", parsed.business_type as ParsedField<unknown>);
  setProfileField(profile.business, "industry", parsed.industry as ParsedField<unknown>);
  setProfileField(profile.business, "products_services", parsed.products_services as ParsedField<unknown>);
  setProfileField(profile.business, "target_customers", parsed.target_customers as ParsedField<unknown>);
  setProfileField(profile.team, "team_size", parsed.team_size as ParsedField<unknown>);
  setProfileField(profile.team, "roles", parsed.roles as ParsedField<unknown>);
  setProfileField(profile.team, "roles_mapping", parsed.roles_mapping as ParsedField<unknown>);
  setProfileField(profile.sales, "lead_sources", parsed.lead_sources as ParsedField<unknown>);
  setProfileField(profile.sales, "sales_process", parsed.sales_process as ParsedField<unknown>);
  setProfileField(profile.sales, "sales_flow", parsed.sales_flow as ParsedField<unknown>);
  setProfileField(profile.sales, "follow_up_style", parsed.follow_up_style as ParsedField<unknown>);
  setProfileField(profile.requirements, "pain_points", parsed.pain_points as ParsedField<unknown>);
  setProfileField(profile.requirements, "problems_faced", parsed.problems_faced as ParsedField<unknown>);
  updateConfidenceMap(profile);

  return profile;
}

export const memoryEngine = mergeBusinessContextIntoProfile;

export function businessContextToCompanyData(parsed: BusinessContext): JsonRecord {
  const company: JsonRecord = {};
  if (parsed.company_name.value) company.name = parsed.company_name.value;
  if (parsed.industry.value) company.industry = parsed.industry.value;
  if (parsed.business_type.value) company.businessType = parsed.business_type.value;
  if (parsed.products_services.value) company.products = parsed.products_services.value;
  if (parsed.target_customers.value) company.targetCustomers = parsed.target_customers.value;
  if (parsed.team_size.value) company.employeeCount = parsed.team_size.value;
  if (parsed.location.value) company.location = parsed.location.value;
  return company;
}

function knownProfileFacts(profile: CompanyProfile) {
  return [
    profile.identity.company_name,
    profile.business.business_type,
    profile.business.products_services,
    profile.team.team_size,
    profile.identity.location,
    profile.sales.lead_sources,
  ]
    .map((item) => asRecord(item).value)
    .filter((item) => item !== undefined && item !== null && (!Array.isArray(item) || item.length));
}

export function analyzeCompanyProfile(profile: CompanyProfile) {
  const required = [
    ["identity", "company_name"],
    ["business", "business_type"],
    ["business", "industry"],
    ["business", "products_services"],
    ["business", "target_customers"],
    ["team", "team_size"],
    ["identity", "location"],
    ["sales", "lead_sources"],
    ["sales", "sales_flow"],
    ["sales", "follow_up_style"],
    ["team", "roles_mapping"],
    ["requirements", "problems_faced"],
  ] as const;
  const missing = required
    .filter(([section, key]) => !asRecord(profile[section][key]).value)
    .map(([, key]) => key);
  const uncertain = required
    .filter(([section, key]) => {
      const item = asRecord(profile[section][key]);
      return item.value && item.confidence_score !== "high";
    })
    .map(([, key]) => key);

  return {
    known: knownProfileFacts(profile),
    missing,
    uncertain,
    decision: uncertain.length ? "confirm" : missing.length ? "ask" : "infer",
  };
}

export const decisionEngine = analyzeCompanyProfile;

export function generateResponse(profile: CompanyProfile, lastInput: string) {
  const context = analyzeCompanyProfile(profile);
  const businessType = asString(asRecord(profile.business.business_type).value, "this business");
  const products = asArray<string>(asRecord(profile.business.products_services).value);
  const teamSize = asRecord(profile.team.team_size).value;
  const understanding = products.length
    ? `Got it. You are running ${products.join(", ")} under a ${businessType} setup${teamSize ? ` with around ${teamSize} people` : ""}.`
    : `Let me break that down. I have captured part of the business context from: "${lastInput.slice(0, 90)}".`;
  const nextQuestion = context.missing.includes("target_customers")
    ? "Do they mainly work with homes, commercial clients, or both?"
    : context.missing.includes("lead_sources")
      ? "Where do most leads come from today: WhatsApp, referrals, website, social media, field visits, or another source?"
      : context.missing.includes("sales_flow")
        ? "What is the normal sales flow from first enquiry to payment or handover?"
        : "What should the Boss dashboard track first: leads, team work, payments, service status, or reports?";

  return `${understanding}\n\n${nextQuestion}`;
}

function inferredSalesPipeline(companyData: JsonRecord, pipelines: EnginePipeline[]) {
  if (pipelines.length) return pipelines;
  const industry = asString(companyData.industry).toLowerCase();
  const stages =
    industry.includes("solar") || industry.includes("cctv") || industry.includes("electrical")
      ? ["Enquiry", "Qualification", "Site visit", "Quotation", "Follow-up", "Payment", "Installation", "Handover"]
      : ["Enquiry", "Discussion", "Follow-up", "Conversion", "Payment", "Execution"];

  return [
    {
      name: "Default Sales Pipeline",
      productName: asString(companyData.industry, "Core service"),
      stages,
      slaRules: { followUp: "Same day for new leads", quotation: "Within 24 hours after requirement clarity" },
      visibleTo: ["Boss", "Sales team"],
      color: "#7C6FFF",
    },
  ];
}

function inferredModuleSuggestions(requirements: JsonRecord, companyData: JsonRecord) {
  const industry = asString(companyData.industry).toLowerCase();
  const modules = uniqueStrings([
    asArray(requirements.modules),
    ["Leads", "Tasks", "Attendance", "Quotation", "Accounts"],
    industry.includes("service") || industry.includes("solar") || industry.includes("cctv") || industry.includes("electrical")
      ? ["Site Visit", "Installation / Service Tracking"]
      : [],
  ]);

  return {
    modules,
    automations: asArray(requirements.automations).length
      ? asArray(requirements.automations)
      : ["Auto-remind owner and assigned employee for overdue follow-ups", "Escalate unassigned leads to Boss"],
    reports: asArray(requirements.reports).length
      ? asArray(requirements.reports)
      : ["Lead funnel report", "Employee performance report", "Revenue and collection report"],
    integrations: asArray(requirements.integrations),
  };
}

function inferredDashboardPlan(requirements: JsonRecord) {
  return {
    bossDashboard: asArray(requirements.dashboardKpis).length
      ? asArray(requirements.dashboardKpis)
      : ["Total leads", "Open follow-ups", "Converted revenue", "Pending payments", "Employee performance"],
    employeeViews: asArray(requirements.permissions).length
      ? asArray(requirements.permissions)
      : ["Employees see assigned leads, tasks, follow-ups, and own performance only"],
    remindersAndEscalations: asArray(requirements.notifications).length
      ? asArray(requirements.notifications)
      : ["Notify assignee for new lead", "Alert Boss when lead is overdue or unassigned"],
    acceptanceCriteria: asArray(requirements.acceptanceCriteria),
  };
}

function mergeProfileIntoExtractedData(
  extractedData: JsonRecord,
  companyProfile: CompanyProfile,
  parsedContext: BusinessContext,
  existingNexaConfig: JsonRecord,
) {
  const company = {
    ...businessContextToCompanyData(parsedContext),
    ...asRecord(extractedData.company),
  };
  const nextNexaConfig = {
    ...existingNexaConfig,
    ...asRecord(extractedData.nexaConfig),
    company_profile: companyProfile,
    short_term_memory: {
      last_input: parsedContext,
      last_updated_at: new Date().toISOString(),
    },
  };

  return {
    ...extractedData,
    company,
    challenges: parsedContext.problems_faced.value
      ? {
          ...asRecord(extractedData.challenges),
          primary: parsedContext.problems_faced.value.join(", "),
        }
      : asRecord(extractedData.challenges),
    nexaConfig: nextNexaConfig,
  };
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
  const canSubmit = score >= 60;

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
  parsedContext: BusinessContext;
  companyProfile: CompanyProfile;
}> {
  const companyData = asRecord(session.companyData);
  const employees = session.employees || [];
  const pipelines = session.pipelines || [];
  const nexaConfigRecord = asRecord(session.nexaConfig);
  const requirements = buildRequirementsFrom(session);
  const parsedContext = parseBusinessContext(userMessage);
  const companyProfile = mergeBusinessContextIntoProfile(
    getProfile(session.nexaConfig),
    parsedContext,
  );
  const contextState = analyzeCompanyProfile(companyProfile);
  const deterministicResponse = generateResponse(companyProfile, userMessage);
  const { score, missing, warnings } = calculateCompleteness(session);

  const systemPrompt = `You are NEXA - the AI Operating Head of BGOS.

You function as a combined CEO + COO + CTO + CXO + Operations Manager.

Your responsibility is to understand businesses, configure systems, guide employees, ensure execution, maintain accountability, and drive growth.

You are not a chatbot. You are a decision-making, execution-oriented operating system for BGOS.

You are also an experienced business operations manager with 30+ years of experience.

You understand businesses from incomplete input.
You think before asking.
You infer intelligently.
You confirm assumptions politely.
You guide conversations efficiently.
You never behave like a chatbot.
You never ask unnecessary questions.
You speak like a calm, confident senior manager.

Behave like a sharp operator who understands Indian SME operations, sales pipelines, teams, payments, dashboards, and software delivery. Your job is to run the end-to-end BGOS onboarding conversation like ChatGPT: intelligent, adaptive, warm, decisive, and commercially aware.

You are not a form bot. You infer what is reasonable, explain your thinking briefly, ask one high-leverage question at a time, and turn messy answers into a precise workspace implementation brief that an SDE can build without guessing.

Audience:
- If the speaker is BDM or Boss, help them complete onboarding fast.
- If Boss is operating, treat it as priority and use owner-level language.
- Always think about final BGOS delivery: Boss dashboard, employee dashboards, permissions, modules, automations, reports, and SDE handoff.

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

PERSISTENT COMPANY PROFILE:
${JSON.stringify(companyProfile)}

LATEST PARSED INPUT:
${JSON.stringify(parsedContext)}

CONTEXT ENGINE STATE:
${JSON.stringify(contextState)}

SHORT TERM MEMORY:
${JSON.stringify(asArray(session.nexaMessages).slice(-6))}

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

OPERATING HEAD DECISION RULES:
1. Think before speaking. Interpret the input, then respond.
2. Connect partial input with previous memory. Do not treat every message as a new form answer.
3. If business = solar/CCTV/electrical, expect enquiry, qualification, site visit, quotation, follow-up, payment, installation, and handover.
4. If business = service, expect lead, discussion, execution, payment, and service follow-up.
5. If team size is more than 10, require role separation between Boss, sales, operations/technical, and accounts.
6. If roles are unclear, propose a default structure instead of waiting.
7. Ensure no lead, follow-up, task, payment, or service work remains unassigned.
8. Suggest the practical BGOS modules needed to run the company: leads, tasks, attendance, quotation, accounts, reports, and service/installation if relevant.
9. Configure dashboards mentally while asking questions: Boss view needs summary, revenue, performance, pending work, and risk; employee view needs assigned leads, tasks, follow-ups, and own results.
10. Skip irrelevant details. Prioritize clarity, accountability, and execution.

CONVERSATION RULES:
1. Every response must follow: understand, summarize, confirm if needed, move forward.
2. Start with understanding, for example: "Got it. You are running a solar and CCTV business with around 10 team members."
3. Confirm only uncertain assumptions. If team size is known, never ask team size again.
4. Ask only what is missing, one question at a time, but make it the most relevant next step.
5. If input is messy, summarize what you extracted and continue.
6. Never say "I didn't understand", "repeat that", or "could you rephrase".
7. Use: "Let me break that down to make sure I got it right..." when input is unclear.
8. If an answer is vague, offer 2-4 likely options and ask them to choose or correct you.
9. Do not interrogate. Make the user feel guided by a competent senior manager.
10. Never say you are only collecting data. Speak as if you are designing their BGOS operating system.
11. Prefer industry-specific follow-ups and practical examples.
12. Keep each response under 120 words unless the user asks for a detailed plan.
13. Never invent confirmed values. You may propose assumptions, but mark them as assumptions.
14. If the user gives multiple details, extract all of them in one pass.
15. Always move toward a build-ready SDE handoff.

QUALITY BAR:
- Sound trained, strategic, and useful.
- Avoid robotic phrases like "I understand" repeated every turn.
- Do not expose JSON, schema, or internal scoring to the user.
- When enough data exists, summarize what is ready and identify the next gap.

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
      "company_profile": {},
      "short_term_memory": [],
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
      response: asString(parsed.message) || deterministicResponse,
      nextStep: asString(parsed.nextStep) || currentStep,
      updatedData: mergeProfileIntoExtractedData(asRecord(parsed.extractedData), companyProfile, parsedContext, nexaConfigRecord),
      newFlags: asArray<string>(parsed.flags),
      suggestions: asArray<string>(parsed.suggestions),
      parsedContext,
      companyProfile,
    };
  } catch (error) {
    console.error("NEXA engine error:", error);
    return {
      response: deterministicResponse,
      nextStep: currentStep,
      updatedData: mergeProfileIntoExtractedData(
        { company: businessContextToCompanyData(parsedContext) },
        companyProfile,
        parsedContext,
        nexaConfigRecord,
      ),
      newFlags: ["NEXA used deterministic onboarding memory because the AI response was unavailable."],
      suggestions: [],
      parsedContext,
      companyProfile,
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
    businessSummary: {
      companyName,
      industry: asString(companyData.industry),
      location: asString(companyData.location),
      teamSize: Number(companyData.employeeCount || employees.length || 0),
      productsServices: companyData.products ?? companyData.services ?? [],
      targetCustomers: companyData.targetCustomers ?? "",
      primaryChallenge: asString(challenges.primary, "Not captured"),
    },
    salesPipeline: inferredSalesPipeline(companyData, pipelines),
    roleAssignment: employees,
    moduleSuggestions: inferredModuleSuggestions(requirements, companyData),
    dashboardConfigurationPlan: inferredDashboardPlan(requirements),
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
    "BUSINESS SUMMARY",
    "------------------------------------------------------------",
    formatKeyValues(structured.businessSummary),
    "",
    "SALES PIPELINE",
    "------------------------------------------------------------",
    formatList(structured.salesPipeline),
    "",
    "ROLE ASSIGNMENT",
    "------------------------------------------------------------",
    formatList(structured.roleAssignment),
    "",
    "MODULE SUGGESTIONS",
    "------------------------------------------------------------",
    formatKeyValues(structured.moduleSuggestions),
    "",
    "DASHBOARD CONFIGURATION PLAN",
    "------------------------------------------------------------",
    formatKeyValues(structured.dashboardConfigurationPlan),
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
