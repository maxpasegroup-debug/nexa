-- Blizzway Pathway Gamification

CREATE TABLE IF NOT EXISTS "BlizzwayPathwayQuest" (
  "id" TEXT NOT NULL,
  "businessModel" TEXT NOT NULL DEFAULT 'blizzway',
  "key" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "level" INTEGER NOT NULL DEFAULT 1,
  "xpReward" INTEGER NOT NULL DEFAULT 0,
  "achievementKey" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BlizzwayPathwayQuest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BlizzwayAchievement" (
  "id" TEXT NOT NULL,
  "businessModel" TEXT NOT NULL DEFAULT 'blizzway',
  "key" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'Pathway',
  "icon" TEXT NOT NULL DEFAULT 'Star',
  "rewardCredits" INTEGER NOT NULL DEFAULT 0,
  "xpReward" INTEGER NOT NULL DEFAULT 0,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BlizzwayAchievement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BlizzwayUserQuest" (
  "id" TEXT NOT NULL,
  "businessModel" TEXT NOT NULL DEFAULT 'blizzway',
  "businessId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "questKey" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'COMPLETED',
  "xpAwarded" INTEGER NOT NULL DEFAULT 0,
  "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "idempotencyKey" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BlizzwayUserQuest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BlizzwayUserAchievement" (
  "id" TEXT NOT NULL,
  "businessModel" TEXT NOT NULL DEFAULT 'blizzway',
  "businessId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "achievementKey" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'UNLOCKED',
  "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "claimedAt" TIMESTAMP(3),
  "rewardCredits" INTEGER NOT NULL DEFAULT 0,
  "ledgerId" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BlizzwayUserAchievement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BlizzwayXpEvent" (
  "id" TEXT NOT NULL,
  "businessModel" TEXT NOT NULL DEFAULT 'blizzway',
  "businessId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "questKey" TEXT,
  "achievementKey" TEXT,
  "xp" INTEGER NOT NULL,
  "idempotencyKey" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BlizzwayXpEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BlizzwayPathwayStreak" (
  "id" TEXT NOT NULL,
  "businessModel" TEXT NOT NULL DEFAULT 'blizzway',
  "businessId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "currentCount" INTEGER NOT NULL DEFAULT 0,
  "longestCount" INTEGER NOT NULL DEFAULT 0,
  "lastCheckInKey" TEXT,
  "lastCheckInAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BlizzwayPathwayStreak_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BlizzwayPathwayLevelProgress" (
  "id" TEXT NOT NULL,
  "businessModel" TEXT NOT NULL DEFAULT 'blizzway',
  "businessId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "currentLevel" INTEGER NOT NULL DEFAULT 1,
  "totalXp" INTEGER NOT NULL DEFAULT 0,
  "levelXp" INTEGER NOT NULL DEFAULT 0,
  "progress" INTEGER NOT NULL DEFAULT 0,
  "completedLevels" JSONB NOT NULL DEFAULT '[]',
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BlizzwayPathwayLevelProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BlizzwayPathwayQuest_businessModel_key_key"
  ON "BlizzwayPathwayQuest"("businessModel", "key");
CREATE INDEX IF NOT EXISTS "BlizzwayPathwayQuest_businessModel_active_sortOrder_idx"
  ON "BlizzwayPathwayQuest"("businessModel", "active", "sortOrder");

CREATE UNIQUE INDEX IF NOT EXISTS "BlizzwayAchievement_businessModel_key_key"
  ON "BlizzwayAchievement"("businessModel", "key");
CREATE INDEX IF NOT EXISTS "BlizzwayAchievement_businessModel_active_sortOrder_idx"
  ON "BlizzwayAchievement"("businessModel", "active", "sortOrder");

CREATE UNIQUE INDEX IF NOT EXISTS "BlizzwayUserQuest_businessModel_businessId_userId_questKey_key"
  ON "BlizzwayUserQuest"("businessModel", "businessId", "userId", "questKey");
CREATE UNIQUE INDEX IF NOT EXISTS "BlizzwayUserQuest_idempotencyKey_key"
  ON "BlizzwayUserQuest"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "BlizzwayUserQuest_businessModel_businessId_userId_status_idx"
  ON "BlizzwayUserQuest"("businessModel", "businessId", "userId", "status");

CREATE UNIQUE INDEX IF NOT EXISTS "BlizzwayUserAchievement_businessModel_businessId_userId_achievementKey_key"
  ON "BlizzwayUserAchievement"("businessModel", "businessId", "userId", "achievementKey");
CREATE INDEX IF NOT EXISTS "BlizzwayUserAchievement_businessModel_businessId_userId_status_idx"
  ON "BlizzwayUserAchievement"("businessModel", "businessId", "userId", "status");

CREATE UNIQUE INDEX IF NOT EXISTS "BlizzwayXpEvent_idempotencyKey_key"
  ON "BlizzwayXpEvent"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "BlizzwayXpEvent_businessModel_businessId_userId_idx"
  ON "BlizzwayXpEvent"("businessModel", "businessId", "userId");
CREATE INDEX IF NOT EXISTS "BlizzwayXpEvent_source_idx"
  ON "BlizzwayXpEvent"("source");
CREATE INDEX IF NOT EXISTS "BlizzwayXpEvent_createdAt_idx"
  ON "BlizzwayXpEvent"("createdAt");

CREATE UNIQUE INDEX IF NOT EXISTS "BlizzwayPathwayStreak_businessModel_businessId_userId_key"
  ON "BlizzwayPathwayStreak"("businessModel", "businessId", "userId");

CREATE UNIQUE INDEX IF NOT EXISTS "BlizzwayPathwayLevelProgress_businessModel_businessId_userId_key"
  ON "BlizzwayPathwayLevelProgress"("businessModel", "businessId", "userId");
CREATE INDEX IF NOT EXISTS "BlizzwayPathwayLevelProgress_businessModel_businessId_userId_currentLevel_idx"
  ON "BlizzwayPathwayLevelProgress"("businessModel", "businessId", "userId", "currentLevel");

ALTER TABLE "BlizzwayUserQuest"
  ADD CONSTRAINT "BlizzwayUserQuest_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlizzwayUserQuest"
  ADD CONSTRAINT "BlizzwayUserQuest_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BlizzwayUserAchievement"
  ADD CONSTRAINT "BlizzwayUserAchievement_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlizzwayUserAchievement"
  ADD CONSTRAINT "BlizzwayUserAchievement_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BlizzwayXpEvent"
  ADD CONSTRAINT "BlizzwayXpEvent_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlizzwayXpEvent"
  ADD CONSTRAINT "BlizzwayXpEvent_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BlizzwayPathwayStreak"
  ADD CONSTRAINT "BlizzwayPathwayStreak_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlizzwayPathwayStreak"
  ADD CONSTRAINT "BlizzwayPathwayStreak_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BlizzwayPathwayLevelProgress"
  ADD CONSTRAINT "BlizzwayPathwayLevelProgress_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlizzwayPathwayLevelProgress"
  ADD CONSTRAINT "BlizzwayPathwayLevelProgress_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
