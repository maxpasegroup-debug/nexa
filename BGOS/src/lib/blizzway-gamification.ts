import type { Prisma } from "@prisma/client";

import type { Career7Context } from "@/lib/career7-auth";
import { topUpCareer7Credits } from "@/lib/career7-wallet";
import { prisma } from "@/lib/prisma";

export const pathwayLevels = [
  { level: 1, key: "discover-yourself", title: "Discover Yourself", xpRequired: 0 },
  { level: 2, key: "build-your-identity", title: "Build Your Identity", xpRequired: 100 },
  { level: 3, key: "grow-your-skills", title: "Grow Your Skills", xpRequired: 200 },
  { level: 4, key: "unlock-opportunities", title: "Unlock Opportunities", xpRequired: 300 },
  { level: 5, key: "global-readiness", title: "Global Readiness", xpRequired: 400 },
  { level: 6, key: "dream-pathway", title: "Dream Pathway", xpRequired: 500 },
] as const;

const xpPerLevel = 100;

export const defaultPathwayQuests = [
  ["complete_onboarding", "Complete onboarding", "Let NEXA learn your current stage, dream goal, and first signals.", 1, 25, "first_spark"],
  ["take_first_assessment", "Take first assessment", "Use one starter assessment to improve your BDP quality.", 1, 25, "self_discovery"],
  ["generate_bdp", "Generate BDP", "Create your first Blizzway Digital Profile draft.", 2, 50, "living_identity"],
  ["activate_first_companion", "Activate first companion", "Bond with one focused companion for your pathway.", 2, 30, "companion_bond"],
  ["complete_first_quick_boost", "Complete first quick boost", "Finish a focused boost for one visible win.", 3, 30, "quick_win"],
  ["add_first_admissions_pathway", "Add first admissions pathway", "Save an admissions route to explore with care.", 4, 30, "admission_explorer"],
  ["complete_first_learning_milestone", "Complete first learning milestone", "Mark one Learning Garden milestone as complete.", 3, 40, "learning_bloom"],
  ["complete_first_earning_milestone", "Complete first earning milestone", "Mark one Earning Universe milestone as complete.", 4, 40, "earning_star"],
  ["publish_bdp_placeholder", "Publish BDP placeholder", "Prepare a safe placeholder for a future public BDP.", 2, 50, null],
  ["complete_7_day_streak", "Complete 7-day streak", "Check in for seven meaningful growth days.", 5, 30, "pathway_streak"],
] as const;

export const defaultAchievements = [
  ["first_spark", "First Spark", "Complete onboarding.", "Pathway", "Sparkles", 25, 0],
  ["self_discovery", "Self Discovery", "Complete your first assessment.", "Assessment", "Compass", 25, 0],
  ["living_identity", "Living Identity", "Generate your BDP.", "BDP", "BadgeCheck", 50, 0],
  ["companion_bond", "Companion Bond", "Activate your first companion.", "Companion", "HeartHandshake", 20, 0],
  ["quick_win", "Quick Win", "Complete your first quick boost.", "Boost", "Zap", 0, 0],
  ["admission_explorer", "Admission Explorer", "Add your first admissions pathway.", "Admissions", "Map", 0, 0],
  ["learning_bloom", "Learning Bloom", "Complete your first learning milestone.", "Learning", "Sprout", 0, 0],
  ["earning_star", "Earning Star", "Complete your first earning milestone.", "Earning", "Star", 0, 0],
  ["pathway_streak", "Pathway Streak", "Complete a seven-day pathway streak.", "Streak", "Flame", 30, 0],
  ["dream_builder", "Dream Builder", "Complete your first pathway level.", "Level", "Trophy", 100, 0],
] as const;

function dateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function previousDateKey(key: string) {
  const date = new Date(`${key}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return dateKey(date);
}

function levelFromXp(totalXp: number) {
  const currentLevel = Math.min(pathwayLevels.length, Math.floor(totalXp / xpPerLevel) + 1);
  const levelXp = currentLevel >= pathwayLevels.length ? xpPerLevel : totalXp % xpPerLevel;
  const progress = currentLevel >= pathwayLevels.length ? 100 : Math.min(100, levelXp);
  const completedCount = Math.min(pathwayLevels.length - 1, Math.floor(totalXp / xpPerLevel));
  const completedLevels = pathwayLevels.slice(0, completedCount).map((item) => item.level);

  return { currentLevel, levelXp, progress, completedLevels };
}

function asJson(value: unknown): Prisma.InputJsonValue {
  return (value ?? {}) as Prisma.InputJsonValue;
}

export async function ensureBlizzwayGamificationDefaults(businessModel = "blizzway") {
  await Promise.all([
    ...defaultPathwayQuests.map(([key, title, description, level, xpReward, achievementKey], index) =>
      prisma.blizzwayPathwayQuest.upsert({
        where: { businessModel_key: { businessModel, key } },
        create: {
          businessModel,
          key,
          title,
          description,
          level,
          xpReward,
          achievementKey,
          sortOrder: index + 1,
          metadata: { seed: "phase10" },
        },
        update: {
          title,
          description,
          level,
          xpReward,
          achievementKey,
          sortOrder: index + 1,
          active: true,
        },
      }),
    ),
    ...defaultAchievements.map(([key, title, description, category, icon, rewardCredits, xpReward], index) =>
      prisma.blizzwayAchievement.upsert({
        where: { businessModel_key: { businessModel, key } },
        create: {
          businessModel,
          key,
          title,
          description,
          category,
          icon,
          rewardCredits,
          xpReward,
          sortOrder: index + 1,
          metadata: { seed: "phase10" },
        },
        update: {
          title,
          description,
          category,
          icon,
          rewardCredits,
          xpReward,
          sortOrder: index + 1,
          active: true,
        },
      }),
    ),
  ]);
}

export async function syncPathwayLevelProgress(context: Career7Context) {
  const aggregate = await prisma.blizzwayXpEvent.aggregate({
    where: {
      businessModel: context.businessModel,
      businessId: context.businessId,
      userId: context.userId,
    },
    _sum: { xp: true },
  });
  const totalXp = aggregate._sum.xp ?? 0;
  const level = levelFromXp(totalXp);

  const progress = await prisma.blizzwayPathwayLevelProgress.upsert({
    where: {
      businessModel_businessId_userId: {
        businessModel: context.businessModel,
        businessId: context.businessId,
        userId: context.userId,
      },
    },
    create: {
      businessModel: context.businessModel,
      businessId: context.businessId,
      userId: context.userId,
      currentLevel: level.currentLevel,
      totalXp,
      levelXp: level.levelXp,
      progress: level.progress,
      completedLevels: level.completedLevels,
    },
    update: {
      currentLevel: level.currentLevel,
      totalXp,
      levelXp: level.levelXp,
      progress: level.progress,
      completedLevels: level.completedLevels,
    },
  });

  if (level.completedLevels.length > 0) {
    await unlockAchievement(context, "dream_builder", { source: "level_progress", completedLevels: level.completedLevels });
  }

  return progress;
}

export async function unlockAchievement(context: Career7Context, achievementKey: string, metadata: unknown = {}) {
  await ensureBlizzwayGamificationDefaults(context.businessModel);
  const achievement = await prisma.blizzwayAchievement.findUnique({
    where: { businessModel_key: { businessModel: context.businessModel, key: achievementKey } },
  });
  if (!achievement || !achievement.active) return null;

  return prisma.blizzwayUserAchievement.upsert({
    where: {
      businessModel_businessId_userId_achievementKey: {
        businessModel: context.businessModel,
        businessId: context.businessId,
        userId: context.userId,
        achievementKey,
      },
    },
    create: {
      businessModel: context.businessModel,
      businessId: context.businessId,
      userId: context.userId,
      achievementKey,
      rewardCredits: achievement.rewardCredits,
      metadata: asJson(metadata),
    },
    update: {},
  });
}

export async function completePathwayQuest(context: Career7Context, questKey: string, metadata: unknown = {}) {
  await ensureBlizzwayGamificationDefaults(context.businessModel);
  const quest = await prisma.blizzwayPathwayQuest.findUnique({
    where: { businessModel_key: { businessModel: context.businessModel, key: questKey } },
  });
  if (!quest || !quest.active) {
    throw new Error("QUEST_NOT_FOUND");
  }

  const existing = await prisma.blizzwayUserQuest.findUnique({
    where: {
      businessModel_businessId_userId_questKey: {
        businessModel: context.businessModel,
        businessId: context.businessId,
        userId: context.userId,
        questKey,
      },
    },
  });

  if (existing) {
    const [levelProgress, achievement] = await Promise.all([
      syncPathwayLevelProgress(context),
      quest.achievementKey ? unlockAchievement(context, quest.achievementKey, { source: "quest_duplicate", questKey }) : null,
    ]);
    return { quest, progress: existing, xpEvent: null, achievement, levelProgress, duplicate: true };
  }

  const idempotencyKey = `quest:${context.businessModel}:${context.businessId}:${context.userId}:${questKey}`;
  const progress = await prisma.blizzwayUserQuest.create({
    data: {
      businessModel: context.businessModel,
      businessId: context.businessId,
      userId: context.userId,
      questKey,
      xpAwarded: quest.xpReward,
      idempotencyKey,
      metadata: asJson(metadata),
    },
  });

  const xpEvent = await prisma.blizzwayXpEvent.upsert({
    where: { idempotencyKey },
    create: {
      businessModel: context.businessModel,
      businessId: context.businessId,
      userId: context.userId,
      source: "quest_complete",
      questKey,
      achievementKey: quest.achievementKey,
      xp: quest.xpReward,
      idempotencyKey,
      metadata: asJson(metadata),
    },
    update: {},
  });

  const achievement = quest.achievementKey
    ? await unlockAchievement(context, quest.achievementKey, { source: "quest_complete", questKey })
    : null;
  const levelProgress = await syncPathwayLevelProgress(context);

  return { quest, progress, xpEvent, achievement, levelProgress, duplicate: false };
}

export async function recordGamificationEvent(
  context: Career7Context,
  source: string,
  metadata: unknown = {},
  xp = 0,
) {
  const idempotencyKey = `event:${context.businessModel}:${context.businessId}:${context.userId}:${source}`;
  const event = await prisma.blizzwayXpEvent.upsert({
    where: { idempotencyKey },
    create: {
      businessModel: context.businessModel,
      businessId: context.businessId,
      userId: context.userId,
      source,
      xp,
      idempotencyKey,
      metadata: asJson(metadata),
    },
    update: {},
  });
  const levelProgress = xp > 0 ? await syncPathwayLevelProgress(context) : null;

  return { event, levelProgress };
}

export async function claimAchievementReward(context: Career7Context, achievementKey: string) {
  await ensureBlizzwayGamificationDefaults(context.businessModel);
  const [achievement, userAchievement] = await Promise.all([
    prisma.blizzwayAchievement.findUnique({
      where: { businessModel_key: { businessModel: context.businessModel, key: achievementKey } },
    }),
    prisma.blizzwayUserAchievement.findUnique({
      where: {
        businessModel_businessId_userId_achievementKey: {
          businessModel: context.businessModel,
          businessId: context.businessId,
          userId: context.userId,
          achievementKey,
        },
      },
    }),
  ]);

  if (!achievement || !achievement.active || !userAchievement) throw new Error("ACHIEVEMENT_NOT_UNLOCKED");
  if (userAchievement.claimedAt) {
    return { achievement, userAchievement, ledger: null, duplicate: true };
  }

  const rewardCredits = achievement.rewardCredits;
  const reward = rewardCredits > 0
    ? await topUpCareer7Credits({
        businessId: context.businessId,
        userId: context.userId,
        amount: rewardCredits,
        businessModel: context.businessModel,
        type: "REWARD",
        source: "pathway_achievement",
        idempotencyKey: `pathway-achievement:${context.businessModel}:${context.businessId}:${context.userId}:${achievementKey}`,
        description: `Achievement reward: ${achievement.title}`,
        metadata: { achievementKey, title: achievement.title, rewardCredits },
      })
    : null;

  const updated = await prisma.blizzwayUserAchievement.update({
    where: { id: userAchievement.id },
    data: {
      status: "CLAIMED",
      claimedAt: new Date(),
      rewardCredits,
      ledgerId: reward?.ledger.id ?? null,
    },
  });

  return { achievement, userAchievement: updated, ledger: reward?.ledger ?? null, duplicate: false };
}

export async function checkInPathwayStreak(context: Career7Context, now = new Date()) {
  const today = dateKey(now);
  const existing = await prisma.blizzwayPathwayStreak.findUnique({
    where: {
      businessModel_businessId_userId: {
        businessModel: context.businessModel,
        businessId: context.businessId,
        userId: context.userId,
      },
    },
  });

  if (existing?.lastCheckInKey === today) {
    return { streak: existing, duplicate: true, questResult: null };
  }

  const nextCount = existing?.lastCheckInKey === previousDateKey(today) ? existing.currentCount + 1 : 1;
  const longestCount = Math.max(existing?.longestCount ?? 0, nextCount);
  const streak = await prisma.blizzwayPathwayStreak.upsert({
    where: {
      businessModel_businessId_userId: {
        businessModel: context.businessModel,
        businessId: context.businessId,
        userId: context.userId,
      },
    },
    create: {
      businessModel: context.businessModel,
      businessId: context.businessId,
      userId: context.userId,
      currentCount: 1,
      longestCount: 1,
      lastCheckInKey: today,
      lastCheckInAt: now,
    },
    update: {
      currentCount: nextCount,
      longestCount,
      lastCheckInKey: today,
      lastCheckInAt: now,
    },
  });

  const questResult = streak.currentCount >= 7
    ? await completePathwayQuest(context, "complete_7_day_streak", { source: "streak_check_in", dayKey: today })
    : null;

  return { streak, duplicate: false, questResult };
}

export async function getGamificationState(context: Career7Context) {
  await ensureBlizzwayGamificationDefaults(context.businessModel);
  const [quests, achievements, completedQuests, userAchievements, streak, levelProgress, wallet] = await Promise.all([
    prisma.blizzwayPathwayQuest.findMany({
      where: { businessModel: context.businessModel, active: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    }),
    prisma.blizzwayAchievement.findMany({
      where: { businessModel: context.businessModel, active: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    }),
    prisma.blizzwayUserQuest.findMany({
      where: { businessModel: context.businessModel, businessId: context.businessId, userId: context.userId },
    }),
    prisma.blizzwayUserAchievement.findMany({
      where: { businessModel: context.businessModel, businessId: context.businessId, userId: context.userId },
    }),
    prisma.blizzwayPathwayStreak.findUnique({
      where: {
        businessModel_businessId_userId: {
          businessModel: context.businessModel,
          businessId: context.businessId,
          userId: context.userId,
        },
      },
    }),
    syncPathwayLevelProgress(context),
    prisma.career7CreditWallet.findUnique({
      where: { businessId_userId: { businessId: context.businessId, userId: context.userId } },
    }),
  ]);

  const completedByKey = new Map(completedQuests.map((item) => [item.questKey, item]));
  const userAchievementByKey = new Map(userAchievements.map((item) => [item.achievementKey, item]));
  const nextQuest = quests.find((quest) => !completedByKey.has(quest.key)) ?? null;
  const currentLevel = pathwayLevels.find((item) => item.level === levelProgress.currentLevel) ?? pathwayLevels[0];
  const availableRewards = userAchievements.filter((item) => !item.claimedAt && item.rewardCredits > 0).length;

  return {
    levels: pathwayLevels.map((level) => ({
      ...level,
      status:
        level.level < levelProgress.currentLevel
          ? "completed"
          : level.level === levelProgress.currentLevel
            ? "active"
            : "locked",
    })),
    progress: {
      currentLevel: levelProgress.currentLevel,
      currentLevelTitle: currentLevel.title,
      totalXp: levelProgress.totalXp,
      levelXp: levelProgress.levelXp,
      nextLevelXp: xpPerLevel,
      progress: levelProgress.progress,
      completedLevels: levelProgress.completedLevels,
    },
    quests: quests.map((quest) => {
      const completed = completedByKey.get(quest.key);
      return {
        key: quest.key,
        title: quest.title,
        description: quest.description,
        level: quest.level,
        xpReward: quest.xpReward,
        achievementKey: quest.achievementKey,
        status: completed ? "completed" : "available",
        completedAt: completed?.completedAt.toISOString() ?? null,
      };
    }),
    achievements: achievements.map((achievement) => {
      const userAchievement = userAchievementByKey.get(achievement.key);
      return {
        key: achievement.key,
        title: achievement.title,
        description: achievement.description,
        category: achievement.category,
        icon: achievement.icon,
        rewardCredits: achievement.rewardCredits,
        xpReward: achievement.xpReward,
        status: userAchievement?.status.toLowerCase() ?? "locked",
        unlockedAt: userAchievement?.unlockedAt.toISOString() ?? null,
        claimedAt: userAchievement?.claimedAt?.toISOString() ?? null,
        claimable: Boolean(userAchievement && !userAchievement.claimedAt && achievement.rewardCredits > 0),
      };
    }),
    streak: {
      currentCount: streak?.currentCount ?? 0,
      longestCount: streak?.longestCount ?? 0,
      lastCheckInKey: streak?.lastCheckInKey ?? null,
      checkedInToday: streak?.lastCheckInKey === dateKey(),
    },
    rewards: {
      available: availableRewards,
      walletCredits: wallet?.balance ?? 0,
    },
    nextQuest: nextQuest
      ? {
          key: nextQuest.key,
          title: nextQuest.title,
          description: nextQuest.description,
          xpReward: nextQuest.xpReward,
          nexaNote: `NEXA recommends this next because it strengthens your ${currentLevel.title} stage without promising jobs, admissions, visas, or income.`,
        }
      : null,
  };
}
