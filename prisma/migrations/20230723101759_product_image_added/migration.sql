-- AlterTable
ALTER TABLE "ProductCategory" ALTER COLUMN "imageUrl" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProductList" ADD COLUMN     "imageUrl" TEXT;
