/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Pharmacy` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Pharmacy` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phoneNumber]` on the table `Pharmacy` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `associatedPharmacy` to the `PharmacyAdmin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PharmacyAdmin" ADD COLUMN     "associatedPharmacy" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Pharmacy_name_key" ON "Pharmacy"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Pharmacy_email_key" ON "Pharmacy"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Pharmacy_phoneNumber_key" ON "Pharmacy"("phoneNumber");

-- AddForeignKey
ALTER TABLE "PharmacyAdmin" ADD CONSTRAINT "PharmacyAdmin_associatedPharmacy_fkey" FOREIGN KEY ("associatedPharmacy") REFERENCES "Pharmacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
