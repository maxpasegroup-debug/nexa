-- CreateEnum
CREATE TYPE "BgosPaymentTransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- AlterEnum
ALTER TYPE "Career7CreditLedgerType" ADD VALUE IF NOT EXISTS 'REWARD';
ALTER TYPE "Career7CreditLedgerType" ADD VALUE IF NOT EXISTS 'MONTHLY_GRANT';

-- AlterTable
ALTER TABLE "BgosPaymentIntent" ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT;

-- AlterTable
ALTER TABLE "Career7CreditLedger" ADD COLUMN IF NOT EXISTS "source" TEXT,
ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT;

-- CreateTable
CREATE TABLE "BgosPaymentTransaction" (
    "id" TEXT NOT NULL,
    "paymentIntentId" TEXT NOT NULL,
    "businessModel" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gateway" "PaymentGatewayProvider" NOT NULL,
    "status" "BgosPaymentTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "providerOrderId" TEXT,
    "providerPaymentId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BgosPaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BgosInvoicePlaceholder" (
    "id" TEXT NOT NULL,
    "businessModel" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paymentIntentId" TEXT,
    "invoiceNumber" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL DEFAULT 'PLACEHOLDER',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BgosInvoicePlaceholder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlizzwayCreditPackage" (
    "id" TEXT NOT NULL,
    "businessModel" TEXT NOT NULL DEFAULT 'blizzway',
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priceInr" INTEGER NOT NULL,
    "baseCredits" INTEGER NOT NULL,
    "bonusCredits" INTEGER NOT NULL DEFAULT 0,
    "totalCredits" INTEGER NOT NULL,
    "badgeLabel" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlizzwayCreditPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlizzwaySubscriptionPlan" (
    "id" TEXT NOT NULL,
    "businessModel" TEXT NOT NULL DEFAULT 'blizzway',
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "monthlyPriceInr" INTEGER NOT NULL,
    "monthlyCredits" INTEGER NOT NULL,
    "features" JSONB NOT NULL DEFAULT '[]',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlizzwaySubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "BgosPaymentIntent_idempotencyKey_key" ON "BgosPaymentIntent"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "BgosPaymentIntent_providerPaymentId_idx" ON "BgosPaymentIntent"("providerPaymentId");

CREATE UNIQUE INDEX "BgosPaymentTransaction_idempotencyKey_key" ON "BgosPaymentTransaction"("idempotencyKey");
CREATE INDEX "BgosPaymentTransaction_paymentIntentId_idx" ON "BgosPaymentTransaction"("paymentIntentId");
CREATE INDEX "BgosPaymentTransaction_businessModel_businessId_userId_idx" ON "BgosPaymentTransaction"("businessModel", "businessId", "userId");
CREATE INDEX "BgosPaymentTransaction_providerOrderId_idx" ON "BgosPaymentTransaction"("providerOrderId");
CREATE INDEX "BgosPaymentTransaction_providerPaymentId_idx" ON "BgosPaymentTransaction"("providerPaymentId");

CREATE UNIQUE INDEX "BgosInvoicePlaceholder_invoiceNumber_key" ON "BgosInvoicePlaceholder"("invoiceNumber");
CREATE INDEX "BgosInvoicePlaceholder_businessModel_businessId_userId_idx" ON "BgosInvoicePlaceholder"("businessModel", "businessId", "userId");
CREATE INDEX "BgosInvoicePlaceholder_paymentIntentId_idx" ON "BgosInvoicePlaceholder"("paymentIntentId");

CREATE UNIQUE INDEX "BlizzwayCreditPackage_businessModel_slug_key" ON "BlizzwayCreditPackage"("businessModel", "slug");
CREATE INDEX "BlizzwayCreditPackage_businessModel_active_sortOrder_idx" ON "BlizzwayCreditPackage"("businessModel", "active", "sortOrder");

CREATE UNIQUE INDEX "BlizzwaySubscriptionPlan_businessModel_slug_key" ON "BlizzwaySubscriptionPlan"("businessModel", "slug");
CREATE INDEX "BlizzwaySubscriptionPlan_businessModel_active_sortOrder_idx" ON "BlizzwaySubscriptionPlan"("businessModel", "active", "sortOrder");

CREATE UNIQUE INDEX IF NOT EXISTS "Career7CreditLedger_idempotencyKey_key" ON "Career7CreditLedger"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "Career7CreditLedger_source_idx" ON "Career7CreditLedger"("source");

-- AddForeignKey
ALTER TABLE "BgosPaymentTransaction" ADD CONSTRAINT "BgosPaymentTransaction_paymentIntentId_fkey" FOREIGN KEY ("paymentIntentId") REFERENCES "BgosPaymentIntent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BgosPaymentTransaction" ADD CONSTRAINT "BgosPaymentTransaction_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BgosPaymentTransaction" ADD CONSTRAINT "BgosPaymentTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BgosInvoicePlaceholder" ADD CONSTRAINT "BgosInvoicePlaceholder_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BgosInvoicePlaceholder" ADD CONSTRAINT "BgosInvoicePlaceholder_paymentIntentId_fkey" FOREIGN KEY ("paymentIntentId") REFERENCES "BgosPaymentIntent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
