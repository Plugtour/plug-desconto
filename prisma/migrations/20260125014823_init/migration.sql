-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('rascunho', 'publicado', 'pausado', 'arquivado');

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "status" "OfferStatus" NOT NULL DEFAULT 'rascunho',
    "description" TEXT,
    "imageUrl" TEXT,
    "priceText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Offer_slug_key" ON "Offer"("slug");

-- CreateIndex
CREATE INDEX "Offer_city_idx" ON "Offer"("city");

-- CreateIndex
CREATE INDEX "Offer_categoryId_idx" ON "Offer"("categoryId");

-- CreateIndex
CREATE INDEX "Offer_status_idx" ON "Offer"("status");
