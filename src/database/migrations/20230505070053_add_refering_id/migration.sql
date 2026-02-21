/*
  Warnings:

  - You are about to drop the column `referralID` on the `Distributor` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[referringId]` on the table `Distributor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `referringId` to the `Distributor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Distributor" DROP CONSTRAINT "Distributor_referredById_fkey";

-- DropIndex
DROP INDEX "Distributor_referralID_key";

-- AlterTable
ALTER TABLE "Distributor" DROP COLUMN "referralID",
ADD COLUMN     "referringId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Distributor_referringId_key" ON "Distributor"("referringId");

-- AddForeignKey
ALTER TABLE "Distributor" ADD CONSTRAINT "Distributor_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "Distributor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
