DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Career7GrowthBoardPath') THEN
    CREATE TYPE "Career7GrowthBoardPath" AS ENUM ('LEARNING', 'EARNING');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Career7GrowthBoardAgentStatus') THEN
    CREATE TYPE "Career7GrowthBoardAgentStatus" AS ENUM ('ACTIVE', 'INACTIVE');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "Career7GrowthBoardAgent" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "agentId" TEXT NOT NULL,
  "path" "Career7GrowthBoardPath" NOT NULL,
  "status" "Career7GrowthBoardAgentStatus" NOT NULL DEFAULT 'ACTIVE',
  "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deactivatedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Career7GrowthBoardAgent_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Career7GrowthBoardAgent_businessId_fkey'
  ) THEN
    ALTER TABLE "Career7GrowthBoardAgent"
      ADD CONSTRAINT "Career7GrowthBoardAgent_businessId_fkey"
      FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Career7GrowthBoardAgent_userId_fkey'
  ) THEN
    ALTER TABLE "Career7GrowthBoardAgent"
      ADD CONSTRAINT "Career7GrowthBoardAgent_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Career7GrowthBoardAgent_agentId_fkey'
  ) THEN
    ALTER TABLE "Career7GrowthBoardAgent"
      ADD CONSTRAINT "Career7GrowthBoardAgent_agentId_fkey"
      FOREIGN KEY ("agentId") REFERENCES "MarketplaceAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Career7GrowthBoardAgent_businessId_userId_agentId_path_key'
  ) THEN
    ALTER TABLE "Career7GrowthBoardAgent"
      ADD CONSTRAINT "Career7GrowthBoardAgent_businessId_userId_agentId_path_key"
      UNIQUE ("businessId", "userId", "agentId", "path");
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS "Career7GrowthBoardAgent_businessId_userId_path_status_idx"
  ON "Career7GrowthBoardAgent"("businessId", "userId", "path", "status");

CREATE INDEX IF NOT EXISTS "Career7GrowthBoardAgent_agentId_idx"
  ON "Career7GrowthBoardAgent"("agentId");
