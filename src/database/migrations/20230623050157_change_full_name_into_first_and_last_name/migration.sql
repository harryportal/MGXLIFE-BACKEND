/*
  Warnings:

  - You are about to drop the column `customerEmail` on the `Order` table. All the data in the column will be lost.
  - Added the required column `customerFirstName` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerLastName` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "customerEmail",
ADD COLUMN     "customerFirstName" TEXT NOT NULL,
ADD COLUMN     "customerLastName" TEXT NOT NULL;
