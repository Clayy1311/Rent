-- DropForeignKey
ALTER TABLE `BookingItem` DROP FOREIGN KEY `BookingItem_itemId_fkey`;

-- AddForeignKey
ALTER TABLE `BookingItem` ADD CONSTRAINT `BookingItem_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
