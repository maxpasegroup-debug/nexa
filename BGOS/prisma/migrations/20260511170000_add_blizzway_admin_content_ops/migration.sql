-- Blizzway Admin Operations content definitions

CREATE TABLE IF NOT EXISTS "BlizzwayAssessmentDefinition" (
  "id" TEXT NOT NULL,
  "businessModel" TEXT NOT NULL DEFAULT 'blizzway',
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "purpose" TEXT,
  "creditCost" INTEGER NOT NULL DEFAULT 0,
  "pricingMode" TEXT NOT NULL DEFAULT 'free',
  "repeatable" BOOLEAN NOT NULL DEFAULT true,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "bdpImpactLabel" TEXT,
  "questionSet" JSONB NOT NULL DEFAULT '[]',
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BlizzwayAssessmentDefinition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BlizzwayAdmissionPathwayDefinition" (
  "id" TEXT NOT NULL,
  "businessModel" TEXT NOT NULL DEFAULT 'blizzway',
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "countryRegion" TEXT NOT NULL,
  "level" TEXT NOT NULL,
  "deadline" TEXT,
  "eligibilitySummary" TEXT NOT NULL,
  "documents" JSONB NOT NULL DEFAULT '[]',
  "scholarships" JSONB NOT NULL DEFAULT '[]',
  "recommendedAssessments" JSONB NOT NULL DEFAULT '[]',
  "recommendedCompanions" JSONB NOT NULL DEFAULT '[]',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BlizzwayAdmissionPathwayDefinition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BlizzwayContentConfig" (
  "id" TEXT NOT NULL,
  "businessModel" TEXT NOT NULL DEFAULT 'blizzway',
  "key" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "value" JSONB NOT NULL DEFAULT '{}',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BlizzwayContentConfig_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BlizzwayAssessmentDefinition_businessModel_slug_key"
  ON "BlizzwayAssessmentDefinition"("businessModel", "slug");
CREATE INDEX IF NOT EXISTS "BlizzwayAssessmentDefinition_businessModel_active_category_idx"
  ON "BlizzwayAssessmentDefinition"("businessModel", "active", "category");

CREATE UNIQUE INDEX IF NOT EXISTS "BlizzwayAdmissionPathwayDefinition_businessModel_slug_key"
  ON "BlizzwayAdmissionPathwayDefinition"("businessModel", "slug");
CREATE INDEX IF NOT EXISTS "BlizzwayAdmissionPathwayDefinition_businessModel_active_countryRegion_idx"
  ON "BlizzwayAdmissionPathwayDefinition"("businessModel", "active", "countryRegion");

CREATE UNIQUE INDEX IF NOT EXISTS "BlizzwayContentConfig_businessModel_key_key"
  ON "BlizzwayContentConfig"("businessModel", "key");
CREATE INDEX IF NOT EXISTS "BlizzwayContentConfig_businessModel_active_idx"
  ON "BlizzwayContentConfig"("businessModel", "active");
