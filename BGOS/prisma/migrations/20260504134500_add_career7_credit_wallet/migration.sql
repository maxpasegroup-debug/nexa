DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Career7CreditLedgerType') THEN
    CREATE TYPE "Career7CreditLedgerType" AS ENUM ('TOP_UP', 'USAGE', 'ADJUSTMENT');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "Career7CreditWallet" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "balance" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Career7CreditWallet_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Career7CreditLedger" (
  "id" TEXT NOT NULL,
  "businessModel" TEXT NOT NULL DEFAULT 'career7',
  "businessId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "walletId" TEXT,
  "type" "Career7CreditLedgerType" NOT NULL,
  "amount" INTEGER NOT NULL,
  "balanceAfter" INTEGER NOT NULL,
  "agentId" TEXT,
  "growthBoardItemId" TEXT,
  "description" TEXT NOT NULL,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Career7CreditLedger_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Career7CreditWallet_businessId_userId_key'
  ) THEN
    ALTER TABLE "Career7CreditWallet"
      ADD CONSTRAINT "Career7CreditWallet_businessId_userId_key"
      UNIQUE ("businessId", "userId");
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Career7CreditWallet_businessId_fkey'
  ) THEN
    ALTER TABLE "Career7CreditWallet"
      ADD CONSTRAINT "Career7CreditWallet_businessId_fkey"
      FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Career7CreditWallet_userId_fkey'
  ) THEN
    ALTER TABLE "Career7CreditWallet"
      ADD CONSTRAINT "Career7CreditWallet_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Career7CreditLedger_businessId_fkey'
  ) THEN
    ALTER TABLE "Career7CreditLedger"
      ADD CONSTRAINT "Career7CreditLedger_businessId_fkey"
      FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Career7CreditLedger_userId_fkey'
  ) THEN
    ALTER TABLE "Career7CreditLedger"
      ADD CONSTRAINT "Career7CreditLedger_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS "Career7CreditWallet_businessId_idx"
  ON "Career7CreditWallet"("businessId");

CREATE INDEX IF NOT EXISTS "Career7CreditLedger_businessModel_businessId_userId_idx"
  ON "Career7CreditLedger"("businessModel", "businessId", "userId");

CREATE INDEX IF NOT EXISTS "Career7CreditLedger_agentId_idx"
  ON "Career7CreditLedger"("agentId");

CREATE INDEX IF NOT EXISTS "Career7CreditLedger_createdAt_idx"
  ON "Career7CreditLedger"("createdAt");
