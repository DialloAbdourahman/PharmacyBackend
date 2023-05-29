/*
  Warnings:

  - You are about to drop the `PharmaceuticalProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "PharmaceuticalProduct";

-- CreateTable
CREATE TABLE "ProductList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ProductList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "reserved" BOOLEAN NOT NULL DEFAULT false,
    "product" TEXT NOT NULL,
    "pharmacySelling" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_product_fkey" FOREIGN KEY ("product") REFERENCES "ProductList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_pharmacySelling_fkey" FOREIGN KEY ("pharmacySelling") REFERENCES "Pharmacy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
