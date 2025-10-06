/*
  Warnings:

  - You are about to drop the column `shiftId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `shift` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `Users_shiftId_fkey`;

-- DropIndex
DROP INDEX `Users_shiftId_fkey` ON `users`;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `shiftId`;

-- DropTable
DROP TABLE `shift`;
