-- CreateTable
CREATE TABLE "SubscriptionTransactions" (
    "id" TEXT NOT NULL,
    "stripeId" TEXT NOT NULL,
    "distributorId" TEXT NOT NULL,

    CONSTRAINT "SubscriptionTransactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionTransactions_stripeId_key" ON "SubscriptionTransactions"("stripeId");

-- AddForeignKey
ALTER TABLE "SubscriptionTransactions" ADD CONSTRAINT "SubscriptionTransactions_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "Distributor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
