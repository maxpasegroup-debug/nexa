-- Blizzway Advanced NEXA conversation persistence.
-- Messages are private, user-scoped, and never exposed through public BDP.

CREATE TABLE IF NOT EXISTS "BlizzwayNexaConversation" (
  "id" TEXT NOT NULL,
  "businessModel" TEXT NOT NULL DEFAULT 'blizzway',
  "businessId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "intent" TEXT NOT NULL DEFAULT 'general_guidance',
  "messages" JSONB NOT NULL DEFAULT '[]',
  "contextSummary" JSONB NOT NULL DEFAULT '{}',
  "provider" TEXT NOT NULL DEFAULT 'rule_based',
  "model" TEXT,
  "fallbackUsed" BOOLEAN NOT NULL DEFAULT false,
  "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BlizzwayNexaConversation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "BlizzwayNexaConversation_businessModel_businessId_userId_updatedAt_idx"
  ON "BlizzwayNexaConversation"("businessModel", "businessId", "userId", "updatedAt");

ALTER TABLE "BlizzwayNexaConversation"
  ADD CONSTRAINT "BlizzwayNexaConversation_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BlizzwayNexaConversation"
  ADD CONSTRAINT "BlizzwayNexaConversation_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
