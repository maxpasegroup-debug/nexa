-- Blizzway Assessment Intelligence Engine v1.
-- Private attempts/results are scoped by business/user and raw answers are never used by public BDP.

ALTER TABLE "BlizzwayAssessmentDefinition"
  ADD COLUMN IF NOT EXISTS "timeRequired" TEXT,
  ADD COLUMN IF NOT EXISTS "isFree" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS "dimensionsMeasured" JSONB NOT NULL DEFAULT '[]';

UPDATE "BlizzwayAssessmentDefinition"
SET
  "isFree" = CASE WHEN "creditCost" <= 0 THEN true ELSE false END,
  "status" = CASE WHEN "active" THEN 'active' ELSE 'archived' END
WHERE "status" IS NULL OR "dimensionsMeasured" IS NULL;

CREATE TABLE IF NOT EXISTS "BlizzwayAssessmentQuestion" (
  "id" TEXT NOT NULL,
  "businessModel" TEXT NOT NULL DEFAULT 'blizzway',
  "assessmentId" TEXT NOT NULL,
  "questionKey" TEXT NOT NULL,
  "prompt" TEXT NOT NULL,
  "questionType" TEXT NOT NULL,
  "dimensionKey" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "required" BOOLEAN NOT NULL DEFAULT true,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BlizzwayAssessmentQuestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BlizzwayAssessmentOption" (
  "id" TEXT NOT NULL,
  "businessModel" TEXT NOT NULL DEFAULT 'blizzway',
  "questionId" TEXT NOT NULL,
  "optionKey" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "score" INTEGER NOT NULL DEFAULT 0,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "BlizzwayAssessmentOption_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BlizzwayAssessmentAttempt" (
  "id" TEXT NOT NULL,
  "businessModel" TEXT NOT NULL DEFAULT 'blizzway',
  "businessId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "assessmentId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
  "idempotencyKey" TEXT,
  "creditsCharged" INTEGER NOT NULL DEFAULT 0,
  "ledgerId" TEXT,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "submittedAt" TIMESTAMP(3),
  "metadata" JSONB NOT NULL DEFAULT '{}',
  CONSTRAINT "BlizzwayAssessmentAttempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BlizzwayAssessmentAnswer" (
  "id" TEXT NOT NULL,
  "businessModel" TEXT NOT NULL DEFAULT 'blizzway',
  "businessId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "attemptId" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "value" JSONB NOT NULL DEFAULT '{}',
  "score" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BlizzwayAssessmentAnswer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BlizzwayAssessmentResult" (
  "id" TEXT NOT NULL,
  "businessModel" TEXT NOT NULL DEFAULT 'blizzway',
  "businessId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "attemptId" TEXT NOT NULL,
  "assessmentId" TEXT NOT NULL,
  "totalScore" INTEGER NOT NULL,
  "maxScore" INTEGER NOT NULL,
  "percentage" INTEGER NOT NULL,
  "percentile" INTEGER,
  "readinessLevel" TEXT NOT NULL,
  "dimensionScores" JSONB NOT NULL DEFAULT '[]',
  "strengths" JSONB NOT NULL DEFAULT '[]',
  "improvementAreas" JSONB NOT NULL DEFAULT '[]',
  "recommendations" JSONB NOT NULL DEFAULT '[]',
  "aiInsight" TEXT NOT NULL,
  "bdpImpact" JSONB NOT NULL DEFAULT '{}',
  "pathwayImpact" JSONB NOT NULL DEFAULT '{}',
  "safetyNote" TEXT NOT NULL,
  "generatedBy" TEXT NOT NULL DEFAULT 'rule_based',
  "outputVersion" TEXT NOT NULL DEFAULT 'assessment_result_v1',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BlizzwayAssessmentResult_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BlizzwayAssessmentRecommendation" (
  "id" TEXT NOT NULL,
  "businessModel" TEXT NOT NULL DEFAULT 'blizzway',
  "category" TEXT NOT NULL,
  "triggerKey" TEXT NOT NULL,
  "assessmentSlug" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "priority" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BlizzwayAssessmentRecommendation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BlizzwayAssessmentQuestion_assessmentId_questionKey_key" ON "BlizzwayAssessmentQuestion"("assessmentId", "questionKey");
CREATE INDEX IF NOT EXISTS "BlizzwayAssessmentQuestion_businessModel_assessmentId_sortOrder_idx" ON "BlizzwayAssessmentQuestion"("businessModel", "assessmentId", "sortOrder");

CREATE UNIQUE INDEX IF NOT EXISTS "BlizzwayAssessmentOption_questionId_optionKey_key" ON "BlizzwayAssessmentOption"("questionId", "optionKey");
CREATE INDEX IF NOT EXISTS "BlizzwayAssessmentOption_businessModel_questionId_sortOrder_idx" ON "BlizzwayAssessmentOption"("businessModel", "questionId", "sortOrder");

CREATE UNIQUE INDEX IF NOT EXISTS "BlizzwayAssessmentAttempt_idempotencyKey_key" ON "BlizzwayAssessmentAttempt"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "BlizzwayAssessmentAttempt_businessModel_businessId_userId_status_idx" ON "BlizzwayAssessmentAttempt"("businessModel", "businessId", "userId", "status");
CREATE INDEX IF NOT EXISTS "BlizzwayAssessmentAttempt_assessmentId_idx" ON "BlizzwayAssessmentAttempt"("assessmentId");

CREATE UNIQUE INDEX IF NOT EXISTS "BlizzwayAssessmentAnswer_attemptId_questionId_key" ON "BlizzwayAssessmentAnswer"("attemptId", "questionId");
CREATE INDEX IF NOT EXISTS "BlizzwayAssessmentAnswer_businessModel_businessId_userId_idx" ON "BlizzwayAssessmentAnswer"("businessModel", "businessId", "userId");

CREATE UNIQUE INDEX IF NOT EXISTS "BlizzwayAssessmentResult_attemptId_key" ON "BlizzwayAssessmentResult"("attemptId");
CREATE INDEX IF NOT EXISTS "BlizzwayAssessmentResult_businessModel_businessId_userId_createdAt_idx" ON "BlizzwayAssessmentResult"("businessModel", "businessId", "userId", "createdAt");
CREATE INDEX IF NOT EXISTS "BlizzwayAssessmentResult_assessmentId_idx" ON "BlizzwayAssessmentResult"("assessmentId");

CREATE UNIQUE INDEX IF NOT EXISTS "BlizzwayAssessmentRecommendation_businessModel_triggerKey_assessmentSlug_key" ON "BlizzwayAssessmentRecommendation"("businessModel", "triggerKey", "assessmentSlug");
CREATE INDEX IF NOT EXISTS "BlizzwayAssessmentRecommendation_businessModel_active_priority_idx" ON "BlizzwayAssessmentRecommendation"("businessModel", "active", "priority");

ALTER TABLE "BlizzwayAssessmentQuestion" ADD CONSTRAINT "BlizzwayAssessmentQuestion_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "BlizzwayAssessmentDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlizzwayAssessmentOption" ADD CONSTRAINT "BlizzwayAssessmentOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "BlizzwayAssessmentQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlizzwayAssessmentAttempt" ADD CONSTRAINT "BlizzwayAssessmentAttempt_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlizzwayAssessmentAttempt" ADD CONSTRAINT "BlizzwayAssessmentAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlizzwayAssessmentAttempt" ADD CONSTRAINT "BlizzwayAssessmentAttempt_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "BlizzwayAssessmentDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlizzwayAssessmentAnswer" ADD CONSTRAINT "BlizzwayAssessmentAnswer_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlizzwayAssessmentAnswer" ADD CONSTRAINT "BlizzwayAssessmentAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlizzwayAssessmentAnswer" ADD CONSTRAINT "BlizzwayAssessmentAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "BlizzwayAssessmentAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlizzwayAssessmentAnswer" ADD CONSTRAINT "BlizzwayAssessmentAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "BlizzwayAssessmentQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlizzwayAssessmentResult" ADD CONSTRAINT "BlizzwayAssessmentResult_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlizzwayAssessmentResult" ADD CONSTRAINT "BlizzwayAssessmentResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlizzwayAssessmentResult" ADD CONSTRAINT "BlizzwayAssessmentResult_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "BlizzwayAssessmentAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlizzwayAssessmentResult" ADD CONSTRAINT "BlizzwayAssessmentResult_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "BlizzwayAssessmentDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
