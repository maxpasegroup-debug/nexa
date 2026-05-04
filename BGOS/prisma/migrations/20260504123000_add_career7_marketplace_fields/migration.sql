DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Career7AgentType') THEN
    CREATE TYPE "Career7AgentType" AS ENUM (
      'LEARNING',
      'EARNING',
      'CAREER',
      'MIGRATION',
      'LANGUAGE',
      'EXAM',
      'FINANCE',
      'BLIZZWAY'
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Career7MarketplaceStatus') THEN
    CREATE TYPE "Career7MarketplaceStatus" AS ENUM (
      'DRAFT',
      'ACTIVE',
      'COMING_SOON',
      'ARCHIVED'
    );
  END IF;
END
$$;

ALTER TABLE "MarketplaceAgent"
  ADD COLUMN IF NOT EXISTS "career7Type" "Career7AgentType",
  ADD COLUMN IF NOT EXISTS "creditPrice" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "career7Status" "Career7MarketplaceStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS "isPrebuilt" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "isRequestable" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "canAddToGrowthBoard" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "MarketplaceAgent_career7Type_idx"
  ON "MarketplaceAgent"("career7Type");

CREATE INDEX IF NOT EXISTS "MarketplaceAgent_career7Status_idx"
  ON "MarketplaceAgent"("career7Status");

CREATE INDEX IF NOT EXISTS "MarketplaceAgent_canAddToGrowthBoard_idx"
  ON "MarketplaceAgent"("canAddToGrowthBoard");
