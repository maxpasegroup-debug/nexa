import { blizzwayCatalogue } from "./catalogue";
import type { Career7Agent } from "@/lib/api";

export const blizzwayMarketplaceCategories = [
  "Resume & Profile",
  "Language & Communication",
  "Exam Coaching",
  "Career Growth",
  "Migration & Global Mobility",
  "Earning & Money Discipline",
  "Happiness & Personal Growth",
  "Blizzway Premium",
] as const;

export type BlizzwayMarketplaceCategory = (typeof blizzwayMarketplaceCategories)[number];

export type BlizzwayMarketplaceItem = {
  id: string;
  slug: string;
  name: string;
  category: BlizzwayMarketplaceCategory;
  description: string;
  credits: number;
  level: "Starter" | "Guided" | "Advanced" | "Premium";
  recommended: boolean;
  status: string;
  icon: string;
};

export type BlizzwayMarketplaceGroup = {
  title: BlizzwayMarketplaceCategory;
  tone: string;
  summary: string;
  items: BlizzwayMarketplaceItem[];
};

const groupMeta = new Map(
  blizzwayCatalogue.map((group) => [
    group.title,
    {
      tone: group.tone,
      summary: group.summary,
    },
  ]),
);

function containsAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

export function inferBlizzwayCategory(agent: Career7Agent): BlizzwayMarketplaceCategory {
  const haystack = `${agent.type ?? ""} ${agent.name} ${agent.description}`.toLowerCase();

  if (containsAny(haystack, ["premium", "guardian", "roadmap", "future vision", "transformation", "blizzway"])) {
    return "Blizzway Premium";
  }

  if (containsAny(haystack, ["resume", "profile", "linkedin", "portfolio", "ats", "cv"])) {
    return "Resume & Profile";
  }

  if (containsAny(haystack, ["visa", "migration", "country", "university", "relocation", "sop", "lor"])) {
    return "Migration & Global Mobility";
  }

  if (containsAny(haystack, ["exam", "ielts", "toefl", "gre", "gmat", "school", "doubt", "study"])) {
    return "Exam Coaching";
  }

  if (containsAny(haystack, ["english", "german", "french", "language", "communication", "accent", "speaking"])) {
    return "Language & Communication";
  }

  if (containsAny(haystack, ["earning", "finance", "freelance", "internship", "side hustle", "money", "income", "offer"])) {
    return "Earning & Money Discipline";
  }

  if (containsAny(haystack, ["happiness", "focus", "confidence", "habit", "burnout", "reflection"])) {
    return "Happiness & Personal Growth";
  }

  return "Career Growth";
}

function levelForCredits(credits: number): BlizzwayMarketplaceItem["level"] {
  if (credits >= 400) return "Premium";
  if (credits >= 220) return "Advanced";
  if (credits >= 140) return "Guided";
  return "Starter";
}

export function initials(value: string) {
  return value
    .split(/[\s/&-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function toBlizzwayMarketplaceItem(agent: Career7Agent): BlizzwayMarketplaceItem {
  return {
    id: agent.id,
    slug: agent.slug,
    name: agent.name,
    category: inferBlizzwayCategory(agent),
    description: agent.description,
    credits: agent.creditPrice,
    level: levelForCredits(agent.creditPrice),
    recommended: Boolean(agent.isFeatured),
    status: agent.status,
    icon: agent.icon || initials(agent.name),
  };
}

export function groupMarketplaceItems(items: BlizzwayMarketplaceItem[]): BlizzwayMarketplaceGroup[] {
  return blizzwayMarketplaceCategories.map((title) => {
    const meta = groupMeta.get(title);

    return {
      title,
      tone: meta?.tone ?? title,
      summary: meta?.summary ?? "Blizzway companion category.",
      items: items.filter((item) => item.category === title),
    };
  });
}

export function filterMarketplaceItems({
  items,
  query,
  category,
}: {
  items: BlizzwayMarketplaceItem[];
  query: string;
  category: string;
}) {
  const normalizedQuery = query.trim().toLowerCase();

  return items.filter((item) => {
    const categoryMatches = category === "All" || item.category === category;
    const queryMatches =
      !normalizedQuery ||
      [item.name, item.category, item.description, item.status].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      );

    return categoryMatches && queryMatches;
  });
}
