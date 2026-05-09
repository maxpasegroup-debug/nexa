CREATE TABLE IF NOT EXISTS "UniverseUser" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "pinHash" TEXT NOT NULL,
  "language" TEXT NOT NULL DEFAULT 'ml',
  "referralCode" TEXT NOT NULL,
  "referredBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UniverseUser_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "UniverseProgress" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "stepNumber" INTEGER NOT NULL,
  "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UniverseProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UniverseUser_phone_key" ON "UniverseUser"("phone");
CREATE UNIQUE INDEX IF NOT EXISTS "UniverseUser_referralCode_key" ON "UniverseUser"("referralCode");
CREATE UNIQUE INDEX IF NOT EXISTS "UniverseProgress_userId_stepNumber_key" ON "UniverseProgress"("userId", "stepNumber");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'UniverseProgress_userId_fkey'
  ) THEN
    ALTER TABLE "UniverseProgress"
      ADD CONSTRAINT "UniverseProgress_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "UniverseUser"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

