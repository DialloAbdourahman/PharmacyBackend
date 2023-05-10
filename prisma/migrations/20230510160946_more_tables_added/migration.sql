/*
  Warnings:

  - Added the required column `titleName` to the `SystemAdmin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SystemAdmin" ADD COLUMN     "titleName" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "PharmacyAdmin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "titleName" TEXT NOT NULL,

    CONSTRAINT "PharmacyAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cachier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "titleName" TEXT NOT NULL,

    CONSTRAINT "Cachier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "titleName" TEXT NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserType" (
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "UserType_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Pharmacy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "hourly" TEXT NOT NULL,

    CONSTRAINT "Pharmacy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PharmaceuticalProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "PharmaceuticalProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complain" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "Complain_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SystemAdmin" ADD CONSTRAINT "SystemAdmin_titleName_fkey" FOREIGN KEY ("titleName") REFERENCES "UserType"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyAdmin" ADD CONSTRAINT "PharmacyAdmin_titleName_fkey" FOREIGN KEY ("titleName") REFERENCES "UserType"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cachier" ADD CONSTRAINT "Cachier_titleName_fkey" FOREIGN KEY ("titleName") REFERENCES "UserType"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_titleName_fkey" FOREIGN KEY ("titleName") REFERENCES "UserType"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
