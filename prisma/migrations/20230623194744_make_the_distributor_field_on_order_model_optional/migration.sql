-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_distributorId_fkey";

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "distributorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "Distributor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
