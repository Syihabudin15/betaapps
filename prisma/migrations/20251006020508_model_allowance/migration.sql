/*
  Warnings:

  - You are about to drop the column `accuracy` on the `absence` table. All the data in the column will be lost.
  - Added the required column `positionsId` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `absence` DROP COLUMN `accuracy`;

-- AlterTable
ALTER TABLE `absencestatus` MODIFY `deductionType` ENUM('PERCENTAGE', 'NOMINAL') NOT NULL DEFAULT 'NOMINAL';

-- AlterTable
ALTER TABLE `positions` ADD COLUMN `allowanceType` ENUM('PERCENTAGE', 'NOMINAL') NOT NULL DEFAULT 'NOMINAL';

-- AlterTable
ALTER TABLE `users` ADD COLUMN `positionsId` VARCHAR(191) NOT NULL,
    ADD COLUMN `principalSalary` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `AllowanceList` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `allowance` INTEGER NOT NULL,
    `allowanceType` ENUM('PERCENTAGE', 'NOMINAL') NOT NULL DEFAULT 'NOMINAL',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_positionsId_fkey` FOREIGN KEY (`positionsId`) REFERENCES `Positions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
