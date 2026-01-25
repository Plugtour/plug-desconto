/*
  Warnings:

  - Added the required column `partnerName` to the `Offer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "partnerName" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Offer_partnerName_idx" ON "Offer"("partnerName");
