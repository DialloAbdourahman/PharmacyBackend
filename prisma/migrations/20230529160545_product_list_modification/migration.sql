/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `ProductList` will be added. If there are existing duplicate values, this will fail.
  - Made the column `description` on table `ProductList` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ProductList" ALTER COLUMN "description" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ProductList_name_key" ON "ProductList"("name");
