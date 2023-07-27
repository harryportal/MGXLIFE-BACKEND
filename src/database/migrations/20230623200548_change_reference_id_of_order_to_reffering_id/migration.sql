-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_distributorId_fkey";

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "Distributor"("referringId") ON DELETE SET NULL ON UPDATE CASCADE;
