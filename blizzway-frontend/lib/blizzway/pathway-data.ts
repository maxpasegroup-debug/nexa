import type { BlizzwayAgent, BlizzwayGrowthBoardItem } from "@/lib/api";
import {
  inferBlizzwayCategory,
  toBlizzwayMarketplaceItem,
  type BlizzwayMarketplaceItem,
} from "./marketplace";

export type PathwayMilestone = {
  title: string;
  tone: string;
  status: string;
};

export type LongRangeGoal = {
  time: string;
  description: string;
};

export type LearningCompanion = {
  id: string;
  name: string;
  category: string;
  description: string;
  progress: string;
  slug?: string;
};

export type EarningOpportunity = {
  title: string;
  type: string;
  fit: string;
  value: string;
};

export const fallbackTimeline = [
  ["Discover", "Career dream map", "Complete", "100%"],
  ["Grow", "Learning Garden sprint", "Active", "72%"],
  ["Prove", "Portfolio proof stack", "Active", "54%"],
  ["Launch", "Opportunity outreach", "Next", "28%"],
];

export const fallbackMilestones: PathwayMilestone[] = [
  { title: "Resume story polished", tone: "Warm Gold", status: "Done" },
  { title: "English intro practiced", tone: "Soft Cyan", status: "In progress" },
  { title: "First portfolio proof note", tone: "Aurora Purple", status: "Today" },
  { title: "Five role shortlist", tone: "Midnight Indigo", status: "Next" },
];

export const fallbackGoals: LongRangeGoal[] = [
  { time: "6 months", description: "Clear role direction, visible proof, and a calm practice habit." },
  { time: "1 year", description: "Stronger profile, confident interviews, and first serious opportunity wins." },
  { time: "3 years", description: "Premium professional identity with a trusted earning rhythm." },
  { time: "5 years", description: "A purpose-led career path with freedom, skill, and confidence." },
];

export const fallbackLearningCompanions: LearningCompanion[] = [
  { id: "language-lumina", name: "Language Lumina", category: "Language training", description: "Daily fluency drills with gentle correction.", progress: "76%" },
  { id: "ielts-oracle", name: "IELTS Oracle", category: "Exam coaching", description: "Band-focused practice plan and confidence map.", progress: "64%" },
  { id: "skill-sprout", name: "Skill Sprout", category: "Skill development", description: "Role-specific skill ladder with proof tasks.", progress: "58%" },
  { id: "study-rhythm", name: "Study Rhythm", category: "Study streaks", description: "Keeps your weekly learning habit alive.", progress: "9 days" },
];

export const fallbackStreaks = [
  ["Communication", "9 day streak"],
  ["Portfolio proof", "4 tasks this week"],
  ["Exam readiness", "2 mock drills"],
];

export const fallbackOpportunities: EarningOpportunity[] = [
  { title: "Junior Product Assistant", type: "Job", fit: "High fit", value: "$42k path" },
  { title: "Resume Rewrite Sprint", type: "Freelance", fit: "Fast start", value: "$120 project" },
  { title: "Campus Ambassador", type: "Internship", fit: "Confidence", value: "$300 stipend" },
];

export const fallbackPipeline = [
  ["Saved", "8"],
  ["Applied", "3"],
  ["Interviewing", "1"],
  ["Offer ideas", "4"],
];

export const fallbackTrackers = [
  ["Money discipline", "68%", "Weekly savings and spending awareness."],
  ["Earning goal", "54%", "First $1,000 project pathway."],
  ["Opportunity rhythm", "76%", "Three reviews every week."],
];

export function boardItemsToMilestones(items: BlizzwayGrowthBoardItem[]): PathwayMilestone[] {
  return items.slice(0, 4).map((item) => ({
    title: item.agent.name,
    tone: item.agent.type ? `${item.agent.type} companion` : "Blizzway companion",
    status: item.status === "active" ? "Active" : "Paused",
  }));
}

export function agentToLearningCompanion(agent: BlizzwayAgent, index: number): LearningCompanion {
  const item = toBlizzwayMarketplaceItem(agent);
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    description: item.description,
    progress: `${Math.min(92, 56 + index * 8)}%`,
    slug: item.slug,
  };
}

export function agentToEarningOpportunity(agent: BlizzwayAgent): EarningOpportunity {
  const item: BlizzwayMarketplaceItem = toBlizzwayMarketplaceItem(agent);
  const category = inferBlizzwayCategory(agent);

  return {
    title: item.name,
    type: category === "Earning & Money Discipline" ? "Earning companion" : "Opportunity companion",
    fit: item.recommended ? "High fit" : "Suggested",
    value: `${item.credits || 0} credits`,
  };
}
