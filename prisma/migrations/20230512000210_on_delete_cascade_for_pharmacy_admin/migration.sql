-- DropForeignKey
ALTER TABLE "PharmacyAdmin" DROP CONSTRAINT "PharmacyAdmin_associatedPharmacy_fkey";

-- AddForeignKey
ALTER TABLE "PharmacyAdmin" ADD CONSTRAINT "PharmacyAdmin_associatedPharmacy_fkey" FOREIGN KEY ("associatedPharmacy") REFERENCES "Pharmacy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
