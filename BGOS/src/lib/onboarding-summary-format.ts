type CallNote = {
  content: string;
  createdAt?: string | Date | null;
  author?: { name?: string | null } | null;
};

type BdmAnalysis = {
  warnings?: unknown;
  tips?: unknown;
  urgentAlerts?: unknown;
  topHooks?: unknown;
  commonPains?: unknown;
  patterns?: unknown;
} | null;

function json(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2);
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function formatNote(note: CallNote) {
  const date = note.createdAt
    ? new Date(note.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : "No date";
  const author = note.author?.name ? ` by ${note.author.name}` : "";
  return `- ${date}${author}: ${note.content}`;
}

export function formatSdeOnboardingSummary(input: {
  companyName: string;
  selectedPlan?: string | null;
  summaryText?: string | null;
  summaryJson?: unknown;
  callNotes?: CallNote[];
  bdmAnalysis?: BdmAnalysis;
}) {
  const analysisLines = [
    ...asArray(input.bdmAnalysis?.patterns),
    ...asArray(input.bdmAnalysis?.warnings),
    ...asArray(input.bdmAnalysis?.tips),
    ...asArray(input.bdmAnalysis?.urgentAlerts),
    ...asArray(input.bdmAnalysis?.commonPains),
  ];

  return [
    `SDE CLAUDE HANDOFF: ${input.companyName}`,
    `PLAN: ${input.selectedPlan ?? "Plan pending"}`,
    "COPY THIS WHOLE BRIEF INTO CLAUDE BEFORE GENERATING THE CODE PROMPT.",
    "",
    "NEXA BUILD-READY SUMMARY",
    input.summaryText ?? "No readable summary generated yet.",
    "",
    "BDM CALL NOTES (from original lead):",
    input.callNotes?.length ? input.callNotes.map(formatNote).join("\n") : "No BDM call notes attached.",
    "",
    "NEXA ANALYSIS NOTES:",
    analysisLines.length ? analysisLines.map((item) => `- ${typeof item === "string" ? item : json(item)}`).join("\n") : "No NEXA BDM analysis notes available yet.",
    "",
    "SDE INSTRUCTIONS:",
    "1. Paste this entire handoff into Claude.",
    "2. Ask Claude to confirm the scope and produce the exact Codex build prompt.",
    "3. Do not build outside the modules, data, permissions, automations, and acceptance criteria above.",
    "4. If the brief has an open gap, raise clarification before coding.",
    "",
    "STRUCTURED JSON",
    json(input.summaryJson),
  ].join("\n");
}
