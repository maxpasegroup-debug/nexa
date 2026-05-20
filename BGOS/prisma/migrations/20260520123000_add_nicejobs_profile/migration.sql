CREATE TABLE "NiceJobsProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT,
    "city" TEXT,
    "country" TEXT,
    "payoutName" TEXT,
    "payoutMethod" TEXT NOT NULL DEFAULT 'BANK',
    "payoutAccountLast4" TEXT,
    "payoutDetails" JSONB NOT NULL DEFAULT '{}',
    "profileStatus" TEXT NOT NULL DEFAULT 'INCOMPLETE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NiceJobsProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NiceJobsProfile_userId_key" ON "NiceJobsProfile"("userId");
CREATE INDEX "NiceJobsProfile_profileStatus_idx" ON "NiceJobsProfile"("profileStatus");

ALTER TABLE "NiceJobsProfile" ADD CONSTRAINT "NiceJobsProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
