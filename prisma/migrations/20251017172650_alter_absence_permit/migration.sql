/*
  Warnings:

  - The values [ALPHA] on the enum `Absence_absenceStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `insentif` on the `permitapps` table. All the data in the column will be lost.
  - You are about to drop the column `insentifType` on the `permitapps` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `absence` ADD COLUMN `lemburAllowance` INTEGER NOT NULL DEFAULT 0,
    MODIFY `absenceStatus` ENUM('HADIR', 'CUTI', 'SAKIT', 'PERDIN', 'LEMBUR') NOT NULL DEFAULT 'HADIR';

-- AlterTable
ALTER TABLE `permitapps` DROP COLUMN `insentif`,
    DROP COLUMN `insentifType`,
    ADD COLUMN `nominal` INTEGER NOT NULL DEFAULT 0;
