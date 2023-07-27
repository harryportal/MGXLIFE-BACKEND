/*
  Warnings:

  - Added the required column `stripeCustomerId` to the `Distributor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Distributor" ADD COLUMN     "stripeCustomerId" TEXT NOT NULL;
