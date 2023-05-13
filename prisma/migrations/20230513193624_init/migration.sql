-- CreateTable
CREATE TABLE "SystemAdmin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "titleName" TEXT NOT NULL DEFAULT 'system_admin',
    "refreshToken" TEXT,

    CONSTRAINT "SystemAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PharmacyAdmin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "titleName" TEXT NOT NULL DEFAULT 'pharmacy_admin',
    "refreshToken" TEXT,
    "associatedPharmacy" TEXT NOT NULL,
    "systemAdminId" TEXT,

    CONSTRAINT "PharmacyAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PharmacyManager" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "titleName" TEXT NOT NULL DEFAULT 'pharmacy_manager',
    "refreshToken" TEXT,
    "creator" TEXT NOT NULL,

    CONSTRAINT "PharmacyManager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cachier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "titleName" TEXT NOT NULL DEFAULT 'cachier',
    "refreshToken" TEXT,
    "creator" TEXT NOT NULL,

    CONSTRAINT "Cachier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "titleName" TEXT NOT NULL DEFAULT 'customer',
    "refreshToken" TEXT,

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
    "allNight" BOOLEAN NOT NULL,
    "creator" TEXT NOT NULL,

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

-- CreateIndex
CREATE UNIQUE INDEX "SystemAdmin_email_key" ON "SystemAdmin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PharmacyAdmin_email_key" ON "PharmacyAdmin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PharmacyAdmin_associatedPharmacy_key" ON "PharmacyAdmin"("associatedPharmacy");

-- CreateIndex
CREATE UNIQUE INDEX "PharmacyManager_email_key" ON "PharmacyManager"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cachier_email_key" ON "Cachier"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Pharmacy_name_key" ON "Pharmacy"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Pharmacy_email_key" ON "Pharmacy"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Pharmacy_phoneNumber_key" ON "Pharmacy"("phoneNumber");

-- AddForeignKey
ALTER TABLE "SystemAdmin" ADD CONSTRAINT "SystemAdmin_titleName_fkey" FOREIGN KEY ("titleName") REFERENCES "UserType"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyAdmin" ADD CONSTRAINT "PharmacyAdmin_titleName_fkey" FOREIGN KEY ("titleName") REFERENCES "UserType"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyAdmin" ADD CONSTRAINT "PharmacyAdmin_associatedPharmacy_fkey" FOREIGN KEY ("associatedPharmacy") REFERENCES "Pharmacy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyAdmin" ADD CONSTRAINT "PharmacyAdmin_systemAdminId_fkey" FOREIGN KEY ("systemAdminId") REFERENCES "SystemAdmin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyManager" ADD CONSTRAINT "PharmacyManager_titleName_fkey" FOREIGN KEY ("titleName") REFERENCES "UserType"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyManager" ADD CONSTRAINT "PharmacyManager_creator_fkey" FOREIGN KEY ("creator") REFERENCES "PharmacyAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cachier" ADD CONSTRAINT "Cachier_titleName_fkey" FOREIGN KEY ("titleName") REFERENCES "UserType"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cachier" ADD CONSTRAINT "Cachier_creator_fkey" FOREIGN KEY ("creator") REFERENCES "PharmacyAdmin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_titleName_fkey" FOREIGN KEY ("titleName") REFERENCES "UserType"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pharmacy" ADD CONSTRAINT "Pharmacy_creator_fkey" FOREIGN KEY ("creator") REFERENCES "SystemAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
