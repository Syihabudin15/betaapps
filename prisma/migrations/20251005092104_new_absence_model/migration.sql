/*
  Warnings:

  - You are about to drop the column `checkIn` on the `absence` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `absence` table. All the data in the column will be lost.
  - You are about to drop the column `earlyLeaveMinutes` on the `absence` table. All the data in the column will be lost.
  - You are about to drop the column `lateMinutes` on the `absence` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `absence` DROP COLUMN `checkIn`,
    DROP COLUMN `date`,
    DROP COLUMN `earlyLeaveMinutes`,
    DROP COLUMN `lateMinutes`;
