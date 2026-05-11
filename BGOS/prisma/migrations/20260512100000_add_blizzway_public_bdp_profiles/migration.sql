CREATE TABLE IF NOT EXISTS "BlizzwayPublicBdpProfile" (
  "id" TEXT NOT NULL,
  "businessModel" TEXT NOT NULL DEFAULT 'blizzway',
  "businessId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "publicSlug" TEXT NOT NULL,
  "isPublic" BOOLEAN NOT NULL DEFAULT false,
  "headline" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "location" TEXT,
  "availability" TEXT,
  "careerGoals" JSONB NOT NULL DEFAULT '[]',
  "skills" JSONB NOT NULL DEFAULT '[]',
  "languages" JSONB NOT NULL DEFAULT '[]',
  "education" JSONB NOT NULL DEFAULT '[]',
  "experience" JSONB NOT NULL DEFAULT '[]',
  "projects" JSONB NOT NULL DEFAULT '[]',
  "achievements" JSONB NOT NULL DEFAULT '[]',
  "assessmentHighlights" JSONB NOT NULL DEFAULT '[]',
  "pathwayHighlights" JSONB NOT NULL DEFAULT '[]',
  "companionHighlights" JSONB NOT NULL DEFAULT '[]',
  "documentHighlights" JSONB NOT NULL DEFAULT '[]',
  "contactVisibility" TEXT NOT NULL DEFAULT 'hidden',
  "recruiterContactEmail" TEXT,
  "lastPublishedAt" TIMESTAMP(3),
  "viewCount" INTEGER NOT NULL DEFAULT 0,
  "privacySettings" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BlizzwayPublicBdpProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BlizzwayPublicBdpProfile_publicSlug_key"
  ON "BlizzwayPublicBdpProfile"("publicSlug");
CREATE UNIQUE INDEX IF NOT EXISTS "BlizzwayPublicBdpProfile_businessModel_businessId_userId_key"
  ON "BlizzwayPublicBdpProfile"("businessModel", "businessId", "userId");
CREATE INDEX IF NOT EXISTS "BlizzwayPublicBdpProfile_businessModel_isPublic_idx"
  ON "BlizzwayPublicBdpProfile"("businessModel", "isPublic");
CREATE INDEX IF NOT EXISTS "BlizzwayPublicBdpProfile_publicSlug_idx"
  ON "BlizzwayPublicBdpProfile"("publicSlug");

ALTER TABLE "BlizzwayPublicBdpProfile"
  ADD CONSTRAINT "BlizzwayPublicBdpProfile_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BlizzwayPublicBdpProfile"
  ADD CONSTRAINT "BlizzwayPublicBdpProfile_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
