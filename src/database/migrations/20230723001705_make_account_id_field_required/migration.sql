/*
  Warnings:

  - Made the column `accountId` on table `Distributor` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Distributor" ALTER COLUMN "accountId" SET NOT NULL;
