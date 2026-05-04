-- CreateEnum
CREATE TYPE "PaymentGatewayProvider" AS ENUM ('RAZORPAY', 'STRIPE', 'PAYPAL', 'CASHFREE', 'MANUAL');

-- CreateEnum
CREATE TYPE "BgosPaymentStatus" AS ENUM ('CREATED', 'PENDING', 'SUCCESS', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "BusinessPaymentConfig" (
    "id" TEXT NOT NULL,
    "businessModel" TEXT NOT NULL,
    "businessId" TEXT,
    "enabledGateways" "PaymentGatewayProvider"[] DEFAULT ARRAY['MANUAL']::"PaymentGatewayProvider"[],
    "defaultGateway" "PaymentGatewayProvider" NOT NULL DEFAULT 'MANUAL',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "credentials" JSONB NOT NULL DEFAULT '{}',
    "config" JSONB NOT NULL DEFAULT '{}',
    "successCallback" TEXT NOT NULL,
    "failureCallback" TEXT NOT NULL,
    "creditTopUpMapping" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessPaymentConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BgosPaymentIntent" (
    "id" TEXT NOT NULL,
    "businessModel" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "configId" TEXT,
    "gateway" "PaymentGatewayProvider" NOT NULL,
    "status" "BgosPaymentStatus" NOT NULL DEFAULT 'CREATED',
    "currency" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "credits" INTEGER,
    "description" TEXT NOT NULL,
    "providerOrderId" TEXT,
    "providerPaymentId" TEXT,
    "successCallback" TEXT NOT NULL,
    "failureCallback" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "BgosPaymentIntent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessPaymentConfig_businessModel_businessId_key" ON "BusinessPaymentConfig"("businessModel", "businessId");

-- CreateIndex
CREATE INDEX "BusinessPaymentConfig_businessModel_idx" ON "BusinessPaymentConfig"("businessModel");

-- CreateIndex
CREATE INDEX "BusinessPaymentConfig_businessId_idx" ON "BusinessPaymentConfig"("businessId");

-- CreateIndex
CREATE INDEX "BgosPaymentIntent_businessModel_businessId_userId_idx" ON "BgosPaymentIntent"("businessModel", "businessId", "userId");

-- CreateIndex
CREATE INDEX "BgosPaymentIntent_gateway_status_idx" ON "BgosPaymentIntent"("gateway", "status");

-- CreateIndex
CREATE INDEX "BgosPaymentIntent_providerOrderId_idx" ON "BgosPaymentIntent"("providerOrderId");

-- CreateIndex
CREATE INDEX "BgosPaymentIntent_createdAt_idx" ON "BgosPaymentIntent"("createdAt");

-- AddForeignKey
ALTER TABLE "BusinessPaymentConfig" ADD CONSTRAINT "BusinessPaymentConfig_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BgosPaymentIntent" ADD CONSTRAINT "BgosPaymentIntent_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BgosPaymentIntent" ADD CONSTRAINT "BgosPaymentIntent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BgosPaymentIntent" ADD CONSTRAINT "BgosPaymentIntent_configId_fkey" FOREIGN KEY ("configId") REFERENCES "BusinessPaymentConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;
