/*
  Warnings:

  - A unique constraint covering the columns `[product]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Product_product_key" ON "Product"("product");
