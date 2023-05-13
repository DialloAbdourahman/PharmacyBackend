/*
  Warnings:

  - You are about to drop the column `systemAdminId` on the `PharmacyAdmin` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PharmacyAdmin" DROP CONSTRAINT "PharmacyAdmin_systemAdminId_fkey";

-- AlterTable
ALTER TABLE "PharmacyAdmin" DROP COLUMN "systemAdminId";
