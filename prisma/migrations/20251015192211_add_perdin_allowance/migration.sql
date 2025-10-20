/*
  Warnings:

  - You are about to drop the column `alphaDeduction` on the `absence` table. All the data in the column will be lost.
  - The values [HADIR,ALPHA] on the enum `PermitApps_absenceStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `absence` DROP COLUMN `alphaDeduction`,
    ADD COLUMN `perdinAllowance` INTEGER NOT NULL DEFAULT 0,
    MODIFY `lateDeduction` INTEGER NOT NULL DEFAULT 0,
    MODIFY `fastLeaveDeduction` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `permitapps` MODIFY `absenceStatus` ENUM('TERLAMBAT', 'PULANGCEPAT', 'CUTI', 'SAKIT', 'PERDIN') NULL;
