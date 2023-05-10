/*
  Warnings:

  - You are about to drop the column `tokens` on the `Cachier` table. All the data in the column will be lost.
  - You are about to drop the column `tokens` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `tokens` on the `PharmacyAdmin` table. All the data in the column will be lost.
  - You are about to drop the column `tokens` on the `SystemAdmin` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cachier" DROP COLUMN "tokens";

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "tokens";

-- AlterTable
ALTER TABLE "PharmacyAdmin" DROP COLUMN "tokens";

-- AlterTable
ALTER TABLE "SystemAdmin" DROP COLUMN "tokens";
