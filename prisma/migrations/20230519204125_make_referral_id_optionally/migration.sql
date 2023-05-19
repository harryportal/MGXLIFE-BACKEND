-- DropForeignKey
ALTER TABLE "Distributor" DROP CONSTRAINT "Distributor_referredById_fkey";

-- AlterTable
ALTER TABLE "Distributor" ALTER COLUMN "referredById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Distributor" ADD CONSTRAINT "Distributor_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "Distributor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
