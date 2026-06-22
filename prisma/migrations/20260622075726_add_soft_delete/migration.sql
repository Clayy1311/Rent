-- AlterTable
ALTER TABLE `Category` ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Item` ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Package` ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;
