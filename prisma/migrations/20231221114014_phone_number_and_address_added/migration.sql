-- AlterTable
ALTER TABLE "Cachier" ADD COLUMN     "address" TEXT,
ADD COLUMN     "phoneNumber" TEXT;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "address" TEXT,
ADD COLUMN     "phoneNumber" TEXT;

-- AlterTable
ALTER TABLE "PharmacyAdmin" ADD COLUMN     "address" TEXT,
ADD COLUMN     "phoneNumber" TEXT;

-- AlterTable
ALTER TABLE "SystemAdmin" ADD COLUMN     "address" TEXT,
ADD COLUMN     "phoneNumber" TEXT;
