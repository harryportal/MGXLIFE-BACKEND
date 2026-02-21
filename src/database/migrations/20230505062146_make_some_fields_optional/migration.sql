-- AlterTable
ALTER TABLE "Distributor" ALTER COLUMN "subscriptionStatus" SET DEFAULT false,
ALTER COLUMN "referralLink" DROP NOT NULL,
ALTER COLUMN "commissionEarned" DROP NOT NULL;
