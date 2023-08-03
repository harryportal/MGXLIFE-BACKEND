/*
  Warnings:

  - You are about to drop the `SubscriptionTransactions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SubscriptionTransactions" DROP CONSTRAINT "SubscriptionTransactions_distributorId_fkey";

-- DropTable
DROP TABLE "SubscriptionTransactions";

-- CreateTable
CREATE TABLE "SubscriptionTransaction" (
    "id" TEXT NOT NULL,
    "stripeId" TEXT NOT NULL,
    "distributorId" TEXT NOT NULL,

    CONSTRAINT "SubscriptionTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionTransaction_stripeId_key" ON "SubscriptionTransaction"("stripeId");

-- AddForeignKey
ALTER TABLE "SubscriptionTransaction" ADD CONSTRAINT "SubscriptionTransaction_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "Distributor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
