/*
  Warnings:

  - A unique constraint covering the columns `[accountId]` on the table `Distributor` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Distributor" ADD COLUMN     "accountId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Distributor_accountId_key" ON "Distributor"("accountId");
