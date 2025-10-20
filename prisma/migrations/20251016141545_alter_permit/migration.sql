/*
  Warnings:

  - You are about to drop the column `payType` on the `insentif` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `insentif` table. All the data in the column will be lost.
  - You are about to drop the column `payType` on the `permitapps` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `permitapps` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `insentif` DROP COLUMN `payType`,
    DROP COLUMN `type`;

-- AlterTable
ALTER TABLE `permitapps` DROP COLUMN `payType`,
    DROP COLUMN `type`;
