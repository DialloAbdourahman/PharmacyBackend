-- AlterTable
ALTER TABLE "SystemAdmin" ADD COLUMN     "creator" TEXT;

-- AddForeignKey
ALTER TABLE "SystemAdmin" ADD CONSTRAINT "SystemAdmin_creator_fkey" FOREIGN KEY ("creator") REFERENCES "SystemAdmin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
