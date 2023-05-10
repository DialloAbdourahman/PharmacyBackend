/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Cachier` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `PharmacyAdmin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `SystemAdmin` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Cachier" ADD COLUMN     "tokens" TEXT[];

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "tokens" TEXT[];

-- AlterTable
ALTER TABLE "PharmacyAdmin" ADD COLUMN     "tokens" TEXT[];

-- AlterTable
ALTER TABLE "SystemAdmin" ADD COLUMN     "tokens" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "Cachier_email_key" ON "Cachier"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PharmacyAdmin_email_key" ON "PharmacyAdmin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SystemAdmin_email_key" ON "SystemAdmin"("email");
