import type { BenefitItem, MarketplaceAgentView, StepItem } from "./types";

export const filters = [
  { label: "All", value: "ALL" },
  { label: "Universal", value: "UNIVERSAL" },
  { label: "Healthcare", value: "HEALTHCARE" },
  { label: "Education", value: "EDUCATION" },
  { label: "Real Estate", value: "REAL_ESTATE" },
  { label: "Construction", value: "CONSTRUCTION" },
  { label: "Retail", value: "RETAIL" },
  { label: "Finance", value: "FINANCE" },
];

const fallbackBenefits: BenefitItem[] = [
  {
    icon: "⚡",
    title: "Faster operations",
    desc: "Automates the repeated work your team handles every day.",
  },
  {
    icon: "📊",
    title: "Clear visibility",
    desc: "Gives owners one place to track activity, results, and follow-ups.",
  },
  {
    icon: "🛠️",
    title: "Set up by BGOS",
    desc: "Our team configures the agent and gets it running in 24 hours.",
  },
];

const fallbackSteps: StepItem[] = [
  {
    step: "01",
    icon: "🔌",
    title: "Install the agent",
    desc: "Confirm setup and autopay from your BGOS workspace.",
  },
  {
    step: "02",
    icon: "🛠️",
    title: "We configure it",
    desc: "The BGOS SDE team connects workflows, data, and approvals.",
  },
  {
    step: "03",
    icon: "🤖",
    title: "NEXA starts working",
    desc: "The agent begins handling tasks and surfacing insights.",
  },
  {
    step: "04",
    icon: "📈",
    title: "Track performance",
    desc: "Monitor usage, outcomes, and business impact from your dashboard.",
  },
];

export function money(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export function categoryLabel(category: string) {
  return category
    .toLowerCase()
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export function jsonArray<T>(value: unknown, fallback: T[] = []) {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

export function benefitsFor(agent: MarketplaceAgentView) {
  return jsonArray<BenefitItem>(agent.benefits, fallbackBenefits);
}

export function stepsFor(agent: MarketplaceAgentView) {
  const steps = jsonArray<StepItem>(agent.howItWorks, []);
  return steps.length > 0 ? steps : fallbackSteps;
}

export function featuresFor(agent: MarketplaceAgentView) {
  return jsonArray<string>(agent.features, []);
}

export function shortDescription(agent: MarketplaceAgentView) {
  return agent.description.length > 118
    ? `${agent.description.slice(0, 118)}...`
    : agent.description;
}

export function recommendationFor(type?: string | null) {
  const normalized = (type ?? "").toLowerCase();
  if (normalized.includes("clinic") || normalized.includes("hospital") || normalized.includes("health")) {
    return "careloop";
  }
  if (normalized.includes("school")) return "classmate";
  if (normalized.includes("academy") || normalized.includes("education") || normalized.includes("training")) {
    return "eduflow";
  }
  if (normalized.includes("real") || normalized.includes("property")) return "proppilot";
  if (normalized.includes("construction") || normalized.includes("builder") || normalized.includes("solar")) {
    return "sitesync";
  }
  if (normalized.includes("retail") || normalized.includes("distribution") || normalized.includes("dealer")) {
    return "stocksense";
  }
  if (normalized.includes("finance") || normalized.includes("tax")) return "taxmate";
  return "sales-booster";
}
