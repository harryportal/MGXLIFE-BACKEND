-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'NOT_ACTIVE');

-- AlterTable
ALTER TABLE "Distributor" ADD COLUMN     "accountStatus" "AccountStatus" NOT NULL DEFAULT 'NOT_ACTIVE';
