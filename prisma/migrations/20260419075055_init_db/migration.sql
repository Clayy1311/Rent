/*
  Warnings:

  - You are about to drop the `Return` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Return` DROP FOREIGN KEY `Return_bookingId_fkey`;

-- AlterTable
ALTER TABLE `BookingItem` ADD COLUMN `packageId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Item` ADD COLUMN `categoryId` INTEGER NULL;

-- DropTable
DROP TABLE `Return`;

-- CreateTable
CREATE TABLE `Category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Package` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `package_name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `min_capacity` INTEGER NOT NULL,
    `max_capacity` INTEGER NOT NULL,
    `discount_price` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PackageItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `package_id` INTEGER NOT NULL,
    `item_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,

    INDEX `PackageItem_package_id_idx`(`package_id`),
    INDEX `PackageItem_item_id_idx`(`item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReturnLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bookingId` INTEGER NOT NULL,
    `returnDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `condition` VARCHAR(191) NOT NULL,
    `penalty` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `ReturnLog_bookingId_key`(`bookingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PackageItem` ADD CONSTRAINT `PackageItem_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `Package`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PackageItem` ADD CONSTRAINT `PackageItem_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookingItem` ADD CONSTRAINT `BookingItem_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReturnLog` ADD CONSTRAINT `ReturnLog_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
