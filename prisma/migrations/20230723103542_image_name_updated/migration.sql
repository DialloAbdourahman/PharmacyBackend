/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `ProductList` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProductList" DROP COLUMN "imageUrl",
ADD COLUMN     "image" TEXT;
