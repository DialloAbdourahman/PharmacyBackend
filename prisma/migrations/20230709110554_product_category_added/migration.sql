/*
  Warnings:

  - Added the required column `category` to the `ProductList` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductList" ADD COLUMN     "category" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_name_key" ON "ProductCategory"("name");

-- AddForeignKey
ALTER TABLE "ProductList" ADD CONSTRAINT "ProductList_category_fkey" FOREIGN KEY ("category") REFERENCES "ProductCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
