/*
  Warnings:

  - The `subscriptionStatus` column on the `Distributor` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('NOT_PAID', 'PAID', 'PENDING');

-- AlterTable
ALTER TABLE "Distributor" DROP COLUMN "subscriptionStatus",
ADD COLUMN     "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'NOT_PAID';
