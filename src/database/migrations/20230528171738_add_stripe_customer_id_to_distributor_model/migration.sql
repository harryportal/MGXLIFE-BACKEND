/*
  Warnings:

  - A unique constraint covering the columns `[stripeCustomerId]` on the table `Distributor` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Distributor_stripeCustomerId_key" ON "Distributor"("stripeCustomerId");
