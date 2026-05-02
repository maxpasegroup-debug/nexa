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

const positioningBySlug: Record<string, { problem: string; does: string; setup: string }> = {
  "sales-booster": {
    problem: "Never miss a hot lead",
    does: "Captures, scores, and follows up with leads from every channel.",
    setup: "Setup in 24-48 hours",
  },
  wazzup: {
    problem: "Run updates from WhatsApp",
    does: "Brings BGOS reminders, summaries, and quick actions into WhatsApp.",
    setup: "Setup in 24 hours",
  },
  careloop: {
    problem: "Reduce missed patient follow-ups",
    does: "Tracks appointments, no-show risk, and patient communication.",
    setup: "Setup in 1-2 days",
  },
  classmate: {
    problem: "Keep parents and students aligned",
    does: "Organizes student updates, reminders, and school follow-ups.",
    setup: "Setup in 1-2 days",
  },
  eduflow: {
    problem: "Convert more enquiries into enrollments",
    does: "Tracks admissions leads, counsellor tasks, and parent follow-ups.",
    setup: "Setup in 1-2 days",
  },
  proppilot: {
    problem: "Turn property enquiries into site visits",
    does: "Matches leads, tracks visits, and keeps follow-ups moving.",
    setup: "Setup in 24-48 hours",
  },
  sitesync: {
    problem: "Keep project work from slipping",
    does: "Tracks milestones, site tasks, delays, and approvals in one place.",
    setup: "Setup in 1-2 days",
  },
  stocksense: {
    problem: "Stay ahead of stock and dealer follow-ups",
    does: "Monitors orders, dealers, payments, and repeat sales activity.",
    setup: "Setup in 1-2 days",
  },
  taxmate: {
    problem: "Stop losing track of finance reminders",
    does: "Tracks invoices, GST tasks, outstanding payments, and renewals.",
    setup: "Setup in 1-2 days",
  },
};

const positioningByCategory: Record<string, { problem: string; does: string; setup: string }> = {
  UNIVERSAL: {
    problem: "Automate repeated team work",
    does: "Adds focused workflows and AI assistance to your BGOS dashboard.",
    setup: "Setup in 24-48 hours",
  },
  HEALTHCARE: {
    problem: "Keep patient operations on track",
    does: "Helps manage appointments, follow-ups, and clinic team tasks.",
    setup: "Setup in 1-2 days",
  },
  EDUCATION: {
    problem: "Improve student and parent follow-up",
    does: "Helps manage enquiries, reminders, and education workflows.",
    setup: "Setup in 1-2 days",
  },
  REAL_ESTATE: {
    problem: "Move leads from enquiry to visit",
    does: "Helps teams prioritize property leads and site visit follow-ups.",
    setup: "Setup in 24-48 hours",
  },
  CONSTRUCTION: {
    problem: "Make project execution visible",
    does: "Helps track site tasks, milestones, and delay signals.",
    setup: "Setup in 1-2 days",
  },
  RETAIL: {
    problem: "Keep orders and dealers moving",
    does: "Helps track stock, orders, payments, and repeat sales.",
    setup: "Setup in 1-2 days",
  },
  FINANCE: {
    problem: "Stay on top of billing work",
    does: "Helps track invoices, tax reminders, and payment follow-ups.",
    setup: "Setup in 1-2 days",
  },
};

export function positioningFor(agent: MarketplaceAgentView) {
  return (
    positioningBySlug[agent.slug] ??
    positioningByCategory[agent.category] ?? {
      problem: agent.tagline,
      does: shortDescription(agent),
      setup: "Setup in 24-48 hours",
    }
  );
}

export function modeLabel(agent: MarketplaceAgentView) {
  return agent.type === "UI" ? "Interactive" : "Runs automatically";
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
