import type { NexaPlaceholderResponse, NexaRecommendation } from "./types";

const defaultChips = ["Review My Pathway", "Plan my next 7 days", "Find Earning Universe opportunities"];

const placeholderMessages: Record<string, string> = {
  "Plan my next 7 days":
    "Here is a focused 7-day sprint: polish your resume, complete one proof task, run two interview drills, and review three high-fit roles before the weekend.",
  "Improve my resume":
    "Start with proof. I would tighten each role into impact bullets, add measurable outcomes, and align the top summary to your target job.",
  "Suggest Learning Garden path":
    "Your Learning Garden path should pair communication practice with portfolio proof: English fluency, role-specific projects, then weekly mock interviews.",
  "Find Earning Universe opportunities":
    "I would scan for fast-fit freelance tasks, entry consulting gigs, and roles where your current proof can create a quick application advantage.",
};

function createPlaceholderRecommendation(message: string): NexaRecommendation {
  return {
    id: `rec_${message.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "next_step"}`,
    title: "Next best action",
    description:
      "Review your My Pathway and choose one Learning Garden or Earning Universe companion that supports this request.",
    actionLabel: "Open My Pathway",
    actionHref: "/growth-board",
    confidence: 0.64,
    source: "placeholder",
  };
}

export function getPlaceholderNexaResponse(
  message: string,
  quickAction?: string,
): NexaPlaceholderResponse {
  const responseKey = quickAction ?? message;
  const responseMessage =
    placeholderMessages[responseKey] ??
    "That is a smart question. I would turn it into one clear next action, then review your My Pathway before choosing the best companion.";

  return {
    message: responseMessage,
    chips: defaultChips,
    recommendations: [createPlaceholderRecommendation(message)],
  };
}
