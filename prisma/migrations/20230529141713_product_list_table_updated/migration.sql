/*
  Warnings:

  - Added the required column `normalPrice` to the `ProductList` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductList" ADD COLUMN     "description" TEXT,
ADD COLUMN     "normalPrice" DOUBLE PRECISION NOT NULL;
