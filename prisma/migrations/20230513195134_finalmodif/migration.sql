/*
  Warnings:

  - Made the column `associatedPharmacy` on table `PharmacyAdmin` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PharmacyAdmin" ALTER COLUMN "associatedPharmacy" SET NOT NULL;
