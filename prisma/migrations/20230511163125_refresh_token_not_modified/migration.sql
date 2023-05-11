-- AlterTable
ALTER TABLE "Cachier" ALTER COLUMN "refreshToken" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "refreshToken" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PharmacyAdmin" ALTER COLUMN "refreshToken" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SystemAdmin" ALTER COLUMN "refreshToken" DROP NOT NULL;
