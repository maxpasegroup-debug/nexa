CREATE TABLE "NiceJobsFranchise" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Micro-franchise',
    "description" TEXT NOT NULL,
    "potentialEarnings" TEXT,
    "commissionPercent" DECIMAL(5,2) NOT NULL,
    "trainingDurationDays" INTEGER NOT NULL DEFAULT 7,
    "partnerWebhookKey" TEXT,
    "partnerWebhookUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NiceJobsFranchise_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NiceJobsApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_MOU',
    "referralCode" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NiceJobsApplication_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NiceJobsAgreement" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "mouDocument" TEXT NOT NULL,
    "signerName" TEXT NOT NULL,
    "signerEmail" TEXT NOT NULL,
    "signatureText" TEXT NOT NULL,
    "commissionPercent" DECIMAL(5,2) NOT NULL,
    "paymentSchedule" TEXT NOT NULL DEFAULT 'Monthly payouts between the 1st and 10th',
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NiceJobsAgreement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NiceJobsTrainingResource" (
    "id" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "resourceType" TEXT NOT NULL,
    "resourceUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NiceJobsTrainingResource_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NiceJobsTrainingProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NiceJobsTrainingProgress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NiceJobsReferral" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "applicationId" TEXT,
    "externalEventId" TEXT,
    "externalCustomerRef" TEXT,
    "saleAmount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "commissionPercent" DECIMAL(5,2) NOT NULL,
    "earningsOwed" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "webhookTimestamp" TIMESTAMP(3),
    "validatedAt" TIMESTAMP(3),
    "rawPayload" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NiceJobsReferral_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NiceJobsPayout" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "provider" TEXT NOT NULL DEFAULT 'MANUAL',
    "providerRef" TEXT,
    "notes" TEXT,
    "scheduledDate" TIMESTAMP(3),
    "paidDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NiceJobsPayout_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NiceJobsWebhookEvent" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "signatureOk" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "payload" JSONB NOT NULL DEFAULT '{}',
    "error" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "NiceJobsWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NiceJobsAuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NiceJobsAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NiceJobsFranchise_slug_key" ON "NiceJobsFranchise"("slug");
CREATE INDEX "NiceJobsFranchise_status_idx" ON "NiceJobsFranchise"("status");
CREATE INDEX "NiceJobsFranchise_category_idx" ON "NiceJobsFranchise"("category");
CREATE UNIQUE INDEX "NiceJobsApplication_referralCode_key" ON "NiceJobsApplication"("referralCode");
CREATE UNIQUE INDEX "NiceJobsApplication_userId_franchiseId_key" ON "NiceJobsApplication"("userId", "franchiseId");
CREATE INDEX "NiceJobsApplication_status_idx" ON "NiceJobsApplication"("status");
CREATE INDEX "NiceJobsApplication_franchiseId_idx" ON "NiceJobsApplication"("franchiseId");
CREATE INDEX "NiceJobsAgreement_applicationId_idx" ON "NiceJobsAgreement"("applicationId");
CREATE INDEX "NiceJobsTrainingResource_franchiseId_idx" ON "NiceJobsTrainingResource"("franchiseId");
CREATE INDEX "NiceJobsTrainingResource_resourceType_idx" ON "NiceJobsTrainingResource"("resourceType");
CREATE UNIQUE INDEX "NiceJobsTrainingProgress_applicationId_resourceId_key" ON "NiceJobsTrainingProgress"("applicationId", "resourceId");
CREATE INDEX "NiceJobsTrainingProgress_userId_idx" ON "NiceJobsTrainingProgress"("userId");
CREATE UNIQUE INDEX "NiceJobsReferral_externalEventId_key" ON "NiceJobsReferral"("externalEventId");
CREATE INDEX "NiceJobsReferral_userId_idx" ON "NiceJobsReferral"("userId");
CREATE INDEX "NiceJobsReferral_franchiseId_idx" ON "NiceJobsReferral"("franchiseId");
CREATE INDEX "NiceJobsReferral_status_idx" ON "NiceJobsReferral"("status");
CREATE UNIQUE INDEX "NiceJobsPayout_userId_month_year_currency_key" ON "NiceJobsPayout"("userId", "month", "year", "currency");
CREATE INDEX "NiceJobsPayout_status_idx" ON "NiceJobsPayout"("status");
CREATE UNIQUE INDEX "NiceJobsWebhookEvent_eventId_key" ON "NiceJobsWebhookEvent"("eventId");
CREATE INDEX "NiceJobsWebhookEvent_source_idx" ON "NiceJobsWebhookEvent"("source");
CREATE INDEX "NiceJobsWebhookEvent_status_idx" ON "NiceJobsWebhookEvent"("status");
CREATE INDEX "NiceJobsAuditLog_actorId_idx" ON "NiceJobsAuditLog"("actorId");
CREATE INDEX "NiceJobsAuditLog_entity_entityId_idx" ON "NiceJobsAuditLog"("entity", "entityId");

ALTER TABLE "NiceJobsApplication" ADD CONSTRAINT "NiceJobsApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NiceJobsApplication" ADD CONSTRAINT "NiceJobsApplication_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "NiceJobsFranchise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NiceJobsAgreement" ADD CONSTRAINT "NiceJobsAgreement_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "NiceJobsApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NiceJobsTrainingResource" ADD CONSTRAINT "NiceJobsTrainingResource_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "NiceJobsFranchise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NiceJobsTrainingProgress" ADD CONSTRAINT "NiceJobsTrainingProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NiceJobsTrainingProgress" ADD CONSTRAINT "NiceJobsTrainingProgress_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "NiceJobsApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NiceJobsTrainingProgress" ADD CONSTRAINT "NiceJobsTrainingProgress_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "NiceJobsTrainingResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NiceJobsReferral" ADD CONSTRAINT "NiceJobsReferral_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NiceJobsReferral" ADD CONSTRAINT "NiceJobsReferral_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "NiceJobsFranchise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NiceJobsReferral" ADD CONSTRAINT "NiceJobsReferral_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "NiceJobsApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "NiceJobsPayout" ADD CONSTRAINT "NiceJobsPayout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NiceJobsAuditLog" ADD CONSTRAINT "NiceJobsAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
