-- CreateTable
CREATE TABLE `AppsConfig` (
    `id` VARCHAR(191) NOT NULL,
    `lateDeduction` INTEGER NOT NULL DEFAULT 10000,
    `fastLeaveDeduction` INTEGER NOT NULL DEFAULT 0,
    `alphaDeduction` INTEGER NOT NULL DEFAULT 0,
    `shiftStart` INTEGER NOT NULL DEFAULT 8,
    `shiftEnd` INTEGER NOT NULL DEFAULT 17,
    `tolerance` INTEGER NOT NULL DEFAULT 5,
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Roles` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `permissions` TEXT NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Positions` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `allowance` DOUBLE NOT NULL DEFAULT 0,
    `allowanceType` ENUM('PERCENTAGE', 'NOMINAL') NOT NULL DEFAULT 'NOMINAL',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `nip` VARCHAR(191) NOT NULL,
    `absenceMethod` ENUM('FACE', 'BUTTON') NOT NULL DEFAULT 'BUTTON',
    `face` TEXT NULL,
    `principalSalary` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `rolesId` VARCHAR(191) NOT NULL,
    `positionsId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GuestBook` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `recipientName` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `type` ENUM('PERSONAL', 'GROUP') NOT NULL,
    `status` ENUM('WILLCOME', 'ALREADYCOME') NOT NULL,
    `checkIn` DATETIME(3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Participant` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `guestBookId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `DeductionList` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `deduction` INTEGER NOT NULL,
    `deductionType` ENUM('PERCENTAGE', 'NOMINAL') NOT NULL DEFAULT 'NOMINAL',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Absence` (
    `id` VARCHAR(191) NOT NULL,
    `absenceMethod` ENUM('FACE', 'BUTTON') NOT NULL,
    `checkOut` DATETIME(3) NULL,
    `geoIn` VARCHAR(191) NOT NULL,
    `geoOut` VARCHAR(191) NULL,
    `absenceStatus` ENUM('HADIR', 'CUTI', 'SAKIT', 'ALPHA', 'PERDIN') NOT NULL DEFAULT 'HADIR',
    `description` VARCHAR(191) NULL,
    `lateDeduction` INTEGER NOT NULL,
    `fastLeaveDeduction` INTEGER NOT NULL,
    `alphaDeduction` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `usersId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Insentif` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('ONEDAY', 'RANGEDAY') NOT NULL DEFAULT 'ONEDAY',
    `insentif` INTEGER NOT NULL,
    `insentifType` ENUM('PERCENTAGE', 'NOMINAL') NOT NULL DEFAULT 'NOMINAL',
    `payType` ENUM('ONETIME', 'DAILY') NOT NULL DEFAULT 'ONETIME',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PermitApps` (
    `id` VARCHAR(191) NOT NULL,
    `absenceStatus` ENUM('HADIR', 'CUTI', 'SAKIT', 'ALPHA', 'PERDIN') NULL,
    `description` TEXT NULL,
    `files` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `type` ENUM('ONEDAY', 'RANGEDAY') NOT NULL DEFAULT 'ONEDAY',
    `insentif` INTEGER NOT NULL DEFAULT 0,
    `insentifType` ENUM('PERCENTAGE', 'NOMINAL') NOT NULL DEFAULT 'NOMINAL',
    `payType` ENUM('ONETIME', 'DAILY') NOT NULL DEFAULT 'ONETIME',
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `approverId` VARCHAR(191) NULL,
    `requesterId` VARCHAR(191) NOT NULL,
    `insentifId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Logs` (
    `id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `geo` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `usersId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_rolesId_fkey` FOREIGN KEY (`rolesId`) REFERENCES `Roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_positionsId_fkey` FOREIGN KEY (`positionsId`) REFERENCES `Positions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Participant` ADD CONSTRAINT `Participant_guestBookId_fkey` FOREIGN KEY (`guestBookId`) REFERENCES `GuestBook`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Absence` ADD CONSTRAINT `Absence_usersId_fkey` FOREIGN KEY (`usersId`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PermitApps` ADD CONSTRAINT `PermitApps_approverId_fkey` FOREIGN KEY (`approverId`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PermitApps` ADD CONSTRAINT `PermitApps_requesterId_fkey` FOREIGN KEY (`requesterId`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PermitApps` ADD CONSTRAINT `PermitApps_insentifId_fkey` FOREIGN KEY (`insentifId`) REFERENCES `Insentif`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Logs` ADD CONSTRAINT `Logs_usersId_fkey` FOREIGN KEY (`usersId`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
