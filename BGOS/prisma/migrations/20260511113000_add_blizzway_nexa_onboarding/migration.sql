-- CreateTable
CREATE TABLE "BlizzwayOnboardingProfile" (
    "id" TEXT NOT NULL,
    "businessModel" TEXT NOT NULL DEFAULT 'blizzway',
    "businessId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStatus" TEXT NOT NULL,
    "dreamGoal" TEXT NOT NULL,
    "preferredLocation" TEXT,
    "educationLevel" TEXT,
    "skills" JSONB NOT NULL DEFAULT '[]',
    "interests" JSONB NOT NULL DEFAULT '[]',
    "confidenceLevel" TEXT,
    "communicationLevel" TEXT,
    "financialReadiness" TEXT,
    "timeline" TEXT,
    "languageGoals" JSONB NOT NULL DEFAULT '[]',
    "admissionsGoals" JSONB NOT NULL DEFAULT '[]',
    "earningGoals" JSONB NOT NULL DEFAULT '[]',
    "answers" JSONB NOT NULL DEFAULT '{}',
    "completionStatus" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlizzwayOnboardingProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlizzwayBdpProfile" (
    "id" TEXT NOT NULL,
    "businessModel" TEXT NOT NULL DEFAULT 'blizzway',
    "businessId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "currentStageSummary" TEXT NOT NULL,
    "strengths" JSONB NOT NULL DEFAULT '[]',
    "readiness" JSONB NOT NULL DEFAULT '{}',
    "recommendedActions" JSONB NOT NULL DEFAULT '[]',
    "profileStrength" INTEGER NOT NULL DEFAULT 35,
    "source" TEXT NOT NULL DEFAULT 'nexa_onboarding_v1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlizzwayBdpProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlizzwayStarterPathway" (
    "id" TEXT NOT NULL,
    "businessModel" TEXT NOT NULL DEFAULT 'blizzway',
    "businessId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "milestones" JSONB NOT NULL DEFAULT '[]',
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "progress" INTEGER NOT NULL DEFAULT 10,
    "achievementHooks" JSONB NOT NULL DEFAULT '[]',
    "source" TEXT NOT NULL DEFAULT 'nexa_onboarding_v1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlizzwayStarterPathway_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlizzwayOnboardingProfile_businessModel_businessId_userId_key" ON "BlizzwayOnboardingProfile"("businessModel", "businessId", "userId");
CREATE INDEX "BlizzwayOnboardingProfile_businessModel_businessId_idx" ON "BlizzwayOnboardingProfile"("businessModel", "businessId");

CREATE UNIQUE INDEX "BlizzwayBdpProfile_businessModel_businessId_userId_key" ON "BlizzwayBdpProfile"("businessModel", "businessId", "userId");
CREATE INDEX "BlizzwayBdpProfile_businessModel_businessId_idx" ON "BlizzwayBdpProfile"("businessModel", "businessId");

CREATE UNIQUE INDEX "BlizzwayStarterPathway_businessModel_businessId_userId_key" ON "BlizzwayStarterPathway"("businessModel", "businessId", "userId");
CREATE INDEX "BlizzwayStarterPathway_businessModel_businessId_idx" ON "BlizzwayStarterPathway"("businessModel", "businessId");

-- AddForeignKey
ALTER TABLE "BlizzwayOnboardingProfile" ADD CONSTRAINT "BlizzwayOnboardingProfile_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlizzwayOnboardingProfile" ADD CONSTRAINT "BlizzwayOnboardingProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BlizzwayBdpProfile" ADD CONSTRAINT "BlizzwayBdpProfile_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlizzwayBdpProfile" ADD CONSTRAINT "BlizzwayBdpProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BlizzwayStarterPathway" ADD CONSTRAINT "BlizzwayStarterPathway_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlizzwayStarterPathway" ADD CONSTRAINT "BlizzwayStarterPathway_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
