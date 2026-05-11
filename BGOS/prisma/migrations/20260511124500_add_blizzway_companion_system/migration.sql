-- Blizzway Companion / Agent System

ALTER TABLE "MarketplaceAgent"
  ADD COLUMN IF NOT EXISTS "businessModel" TEXT NOT NULL DEFAULT 'blizzway',
  ADD COLUMN IF NOT EXISTS "businessId" TEXT,
  ADD COLUMN IF NOT EXISTS "companionCategory" TEXT,
  ADD COLUMN IF NOT EXISTS "shortDescription" TEXT,
  ADD COLUMN IF NOT EXISTS "longDescription" TEXT,
  ADD COLUMN IF NOT EXISTS "pricingMode" TEXT NOT NULL DEFAULT 'credits',
  ADD COLUMN IF NOT EXISTS "isTrending" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "capabilities" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "expectedOutput" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "recommendedFor" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "requiredInputs" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "chargeOn" TEXT NOT NULL DEFAULT 'run';

CREATE TABLE IF NOT EXISTS "BlizzwayCompanionActivation" (
  "id" TEXT NOT NULL,
  "businessModel" TEXT NOT NULL DEFAULT 'blizzway',
  "businessId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "companionId" TEXT NOT NULL,
  "attachedTo" TEXT NOT NULL DEFAULT 'pathway',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BlizzwayCompanionActivation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BlizzwayCompanionRun" (
  "id" TEXT NOT NULL,
  "businessModel" TEXT NOT NULL DEFAULT 'blizzway',
  "businessId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "companionId" TEXT NOT NULL,
  "activationId" TEXT,
  "input" JSONB NOT NULL DEFAULT '{}',
  "output" JSONB NOT NULL DEFAULT '{}',
  "creditsCharged" INTEGER NOT NULL DEFAULT 0,
  "ledgerId" TEXT,
  "idempotencyKey" TEXT,
  "status" TEXT NOT NULL DEFAULT 'COMPLETED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BlizzwayCompanionRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BlizzwayCompanionRequest" (
  "id" TEXT NOT NULL,
  "businessModel" TEXT NOT NULL DEFAULT 'blizzway',
  "businessId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "expectedOutput" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BlizzwayCompanionRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BlizzwayCompanionActivation_businessModel_businessId_userId_companionId_key"
  ON "BlizzwayCompanionActivation"("businessModel", "businessId", "userId", "companionId");
CREATE INDEX IF NOT EXISTS "BlizzwayCompanionActivation_businessModel_businessId_userId_status_idx"
  ON "BlizzwayCompanionActivation"("businessModel", "businessId", "userId", "status");
CREATE INDEX IF NOT EXISTS "BlizzwayCompanionActivation_companionId_idx"
  ON "BlizzwayCompanionActivation"("companionId");

CREATE UNIQUE INDEX IF NOT EXISTS "BlizzwayCompanionRun_idempotencyKey_key"
  ON "BlizzwayCompanionRun"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "BlizzwayCompanionRun_businessModel_businessId_userId_idx"
  ON "BlizzwayCompanionRun"("businessModel", "businessId", "userId");
CREATE INDEX IF NOT EXISTS "BlizzwayCompanionRun_companionId_idx"
  ON "BlizzwayCompanionRun"("companionId");
CREATE INDEX IF NOT EXISTS "BlizzwayCompanionRun_createdAt_idx"
  ON "BlizzwayCompanionRun"("createdAt");

CREATE INDEX IF NOT EXISTS "BlizzwayCompanionRequest_businessModel_businessId_userId_idx"
  ON "BlizzwayCompanionRequest"("businessModel", "businessId", "userId");
CREATE INDEX IF NOT EXISTS "BlizzwayCompanionRequest_status_idx"
  ON "BlizzwayCompanionRequest"("status");

CREATE INDEX IF NOT EXISTS "MarketplaceAgent_businessModel_businessId_idx"
  ON "MarketplaceAgent"("businessModel", "businessId");
CREATE INDEX IF NOT EXISTS "MarketplaceAgent_companionCategory_idx"
  ON "MarketplaceAgent"("companionCategory");

ALTER TABLE "BlizzwayCompanionActivation"
  ADD CONSTRAINT "BlizzwayCompanionActivation_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlizzwayCompanionActivation"
  ADD CONSTRAINT "BlizzwayCompanionActivation_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlizzwayCompanionActivation"
  ADD CONSTRAINT "BlizzwayCompanionActivation_companionId_fkey"
  FOREIGN KEY ("companionId") REFERENCES "MarketplaceAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BlizzwayCompanionRun"
  ADD CONSTRAINT "BlizzwayCompanionRun_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlizzwayCompanionRun"
  ADD CONSTRAINT "BlizzwayCompanionRun_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlizzwayCompanionRun"
  ADD CONSTRAINT "BlizzwayCompanionRun_companionId_fkey"
  FOREIGN KEY ("companionId") REFERENCES "MarketplaceAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BlizzwayCompanionRequest"
  ADD CONSTRAINT "BlizzwayCompanionRequest_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlizzwayCompanionRequest"
  ADD CONSTRAINT "BlizzwayCompanionRequest_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
