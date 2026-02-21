/*
  Warnings:

  - The values [NOT_PAID] on the enum `SubscriptionStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionStatus_new" AS ENUM ('UNPAID', 'PAID', 'PENDING');
ALTER TABLE "Distributor" ALTER COLUMN "subscriptionStatus" DROP DEFAULT;
ALTER TABLE "Distributor" ALTER COLUMN "subscriptionStatus" TYPE "SubscriptionStatus_new" USING ("subscriptionStatus"::text::"SubscriptionStatus_new");
ALTER TYPE "SubscriptionStatus" RENAME TO "SubscriptionStatus_old";
ALTER TYPE "SubscriptionStatus_new" RENAME TO "SubscriptionStatus";
DROP TYPE "SubscriptionStatus_old";
ALTER TABLE "Distributor" ALTER COLUMN "subscriptionStatus" SET DEFAULT 'UNPAID';
COMMIT;

-- AlterTable
ALTER TABLE "Distributor" ALTER COLUMN "subscriptionStatus" SET DEFAULT 'UNPAID';
