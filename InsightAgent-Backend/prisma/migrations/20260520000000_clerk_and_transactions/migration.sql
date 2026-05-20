-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('USAGE', 'PURCHASE', 'REFUND');

-- AlterTable
ALTER TABLE "User" 
  DROP COLUMN "passwordHash",
  DROP COLUMN "tier",
  DROP COLUMN "queriesUsed",
  DROP COLUMN "queriesResetAt",
  ADD COLUMN "clerkUserId" TEXT NOT NULL,
  ADD COLUMN "creditsBalance" INTEGER NOT NULL DEFAULT 5;

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "TransactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- DropEnum
DROP TYPE "SubscriptionTier";

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "User"("clerkUserId");

-- CreateIndex
CREATE INDEX "CreditTransaction_userId_idx" ON "CreditTransaction"("userId");

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
