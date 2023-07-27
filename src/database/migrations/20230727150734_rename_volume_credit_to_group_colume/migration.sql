/*
  Warnings:

  - You are about to drop the column `volumecredit` on the `Distributor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Distributor" DROP COLUMN "volumecredit",
ADD COLUMN     "groupVolume" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
