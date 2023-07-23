/*
  Warnings:

  - Made the column `commissionEarned` on table `Distributor` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Distributor" ALTER COLUMN "commissionEarned" SET NOT NULL;
