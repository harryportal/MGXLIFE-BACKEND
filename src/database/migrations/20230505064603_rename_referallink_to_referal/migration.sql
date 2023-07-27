/*
  Warnings:

  - You are about to drop the column `referralLink` on the `Distributor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Distributor" DROP COLUMN "referralLink",
ADD COLUMN     "referralID" TEXT;
