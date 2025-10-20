/*
  Warnings:

  - You are about to drop the column `lastAbsenceMinutes` on the `appsconfig` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `appsconfig` DROP COLUMN `lastAbsenceMinutes`,
    ADD COLUMN `lastAbsence` INTEGER NOT NULL DEFAULT 17;
