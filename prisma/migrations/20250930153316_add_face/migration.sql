/*
  Warnings:

  - Added the required column `accuracy` to the `Absence` table without a default value. This is not possible if the table is not empty.
  - Added the required column `geo` to the `Absence` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `absence` ADD COLUMN `accuracy` INTEGER NOT NULL,
    ADD COLUMN `geo` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `face` TEXT NULL;
