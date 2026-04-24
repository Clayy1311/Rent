/*
  Warnings:

  - You are about to drop the `ReturnLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ReturnLog` DROP FOREIGN KEY `ReturnLog_bookingId_fkey`;

-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `actualReturnDate` DATETIME(3) NULL,
    ADD COLUMN `adminNote` VARCHAR(191) NULL,
    ADD COLUMN `penaltyAmount` INTEGER NULL DEFAULT 0;

-- DropTable
DROP TABLE `ReturnLog`;
