-- CreateEnum
CREATE TYPE "KycType" AS ENUM ('citizenship', 'nid');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('seller_submitted', 'seller_approved', 'seller_rejected', 'general');

-- Add required columns to User with defaults for existing rows
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firstName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT NOT NULL DEFAULT '';

-- Remove defaults after backfill (so new rows must provide them)
ALTER TABLE "User" ALTER COLUMN "firstName" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "lastName" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "phone" DROP DEFAULT;

-- Add updatedAt to SellerProfile
ALTER TABLE "SellerProfile" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Drop old businessName column (moved to step 2 as storeName)
ALTER TABLE "SellerProfile" DROP COLUMN IF EXISTS "businessName";

-- Change businessAddress to nullable (now step 2)
ALTER TABLE "SellerProfile" ALTER COLUMN "businessAddress" DROP NOT NULL;

-- Change approvalStatus default to 'draft'
ALTER TABLE "SellerProfile" ALTER COLUMN "approvalStatus" SET DEFAULT 'draft';

-- Add onboarding step tracking
ALTER TABLE "SellerProfile" ADD COLUMN IF NOT EXISTS "onboardingStep" INTEGER NOT NULL DEFAULT 1;

-- Add Step 2 fields (Business Info)
ALTER TABLE "SellerProfile" ADD COLUMN IF NOT EXISTS "storeName" TEXT;
ALTER TABLE "SellerProfile" ADD COLUMN IF NOT EXISTS "businessType" TEXT;
ALTER TABLE "SellerProfile" ADD COLUMN IF NOT EXISTS "panOrVatNumber" TEXT;

-- Add Step 3 fields (KYC)
ALTER TABLE "SellerProfile" ADD COLUMN IF NOT EXISTS "kycType" "KycType";
ALTER TABLE "SellerProfile" ADD COLUMN IF NOT EXISTS "kycNumber" TEXT;
ALTER TABLE "SellerProfile" ADD COLUMN IF NOT EXISTS "kycFrontImageUrl" TEXT;
ALTER TABLE "SellerProfile" ADD COLUMN IF NOT EXISTS "kycBackImageUrl" TEXT;
ALTER TABLE "SellerProfile" ADD COLUMN IF NOT EXISTS "selfieImageUrl" TEXT;

-- Add Step 4 fields (Bank Details)
ALTER TABLE "SellerProfile" ADD COLUMN IF NOT EXISTS "bankName" TEXT;
ALTER TABLE "SellerProfile" ADD COLUMN IF NOT EXISTS "accountHolderName" TEXT;
ALTER TABLE "SellerProfile" ADD COLUMN IF NOT EXISTS "accountNumber" TEXT;
ALTER TABLE "SellerProfile" ADD COLUMN IF NOT EXISTS "branchName" TEXT;

-- Add Step 5 fields (Store Profile)
ALTER TABLE "SellerProfile" ADD COLUMN IF NOT EXISTS "storeLogoUrl" TEXT;
ALTER TABLE "SellerProfile" ADD COLUMN IF NOT EXISTS "storeBannerUrl" TEXT;
ALTER TABLE "SellerProfile" ADD COLUMN IF NOT EXISTS "storeDescription" TEXT;
ALTER TABLE "SellerProfile" ADD COLUMN IF NOT EXISTS "pickupLocation" TEXT;

-- CreateTable Notification
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
