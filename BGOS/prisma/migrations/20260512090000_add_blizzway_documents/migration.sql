CREATE TABLE IF NOT EXISTS "BlizzwayDocument" (
  "id" TEXT NOT NULL,
  "businessModel" TEXT NOT NULL DEFAULT 'blizzway',
  "businessId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "documentType" TEXT NOT NULL,
  "originalFilename" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "storageKey" TEXT NOT NULL,
  "parsedText" TEXT,
  "parsedSummary" TEXT,
  "extractedMetadata" JSONB NOT NULL DEFAULT '{}',
  "privacyLevel" TEXT NOT NULL DEFAULT 'private',
  "status" TEXT NOT NULL DEFAULT 'uploaded',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BlizzwayDocument_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "BlizzwayDocument_businessModel_businessId_userId_idx"
  ON "BlizzwayDocument"("businessModel", "businessId", "userId");
CREATE INDEX IF NOT EXISTS "BlizzwayDocument_documentType_idx"
  ON "BlizzwayDocument"("documentType");
CREATE INDEX IF NOT EXISTS "BlizzwayDocument_status_idx"
  ON "BlizzwayDocument"("status");
CREATE INDEX IF NOT EXISTS "BlizzwayDocument_createdAt_idx"
  ON "BlizzwayDocument"("createdAt");

ALTER TABLE "BlizzwayDocument"
  ADD CONSTRAINT "BlizzwayDocument_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BlizzwayDocument"
  ADD CONSTRAINT "BlizzwayDocument_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
