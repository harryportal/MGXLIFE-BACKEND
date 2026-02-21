/*
  Warnings:

  - A unique constraint covering the columns `[referralID]` on the table `Distributor` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Distributor" DROP CONSTRAINT "Distributor_referredById_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "Distributor_referralID_key" ON "Distributor"("referralID");

-- AddForeignKey
ALTER TABLE "Distributor" ADD CONSTRAINT "Distributor_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "Distributor"("referralID") ON DELETE RESTRICT ON UPDATE CASCADE;
