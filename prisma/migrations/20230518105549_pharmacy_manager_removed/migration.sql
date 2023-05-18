/*
  Warnings:

  - You are about to drop the `PharmacyManager` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PharmacyManager" DROP CONSTRAINT "PharmacyManager_associatedPharmacy_fkey";

-- DropForeignKey
ALTER TABLE "PharmacyManager" DROP CONSTRAINT "PharmacyManager_creator_fkey";

-- DropForeignKey
ALTER TABLE "PharmacyManager" DROP CONSTRAINT "PharmacyManager_titleName_fkey";

-- DropIndex
DROP INDEX "PharmacyAdmin_associatedPharmacy_key";

-- AlterTable
ALTER TABLE "PharmacyAdmin" ADD COLUMN     "creator" TEXT;

-- DropTable
DROP TABLE "PharmacyManager";

-- AddForeignKey
ALTER TABLE "PharmacyAdmin" ADD CONSTRAINT "PharmacyAdmin_creator_fkey" FOREIGN KEY ("creator") REFERENCES "PharmacyAdmin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
