-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `offlineCustomerId` INTEGER NULL;

-- CreateTable
CREATE TABLE `OfflineCustomer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_offlineCustomerId_fkey` FOREIGN KEY (`offlineCustomerId`) REFERENCES `OfflineCustomer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
