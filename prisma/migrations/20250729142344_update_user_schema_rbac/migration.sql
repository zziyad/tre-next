/*
  Warnings:

  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `surname` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SUPERVISOR', 'USER');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('CREATE_USER', 'READ_USER', 'UPDATE_USER', 'DELETE_USER', 'CREATE_EVENT', 'READ_EVENT', 'UPDATE_EVENT', 'DELETE_EVENT', 'CREATE_FLIGHT_SCHEDULE', 'READ_FLIGHT_SCHEDULE', 'UPDATE_FLIGHT_SCHEDULE', 'DELETE_FLIGHT_SCHEDULE', 'UPLOAD_FLIGHT_SCHEDULE', 'CREATE_TRANSPORT_REPORT', 'READ_TRANSPORT_REPORT', 'UPDATE_TRANSPORT_REPORT', 'DELETE_TRANSPORT_REPORT', 'CREATE_REAL_TIME_STATUS', 'READ_REAL_TIME_STATUS', 'UPDATE_REAL_TIME_STATUS', 'DELETE_REAL_TIME_STATUS', 'CREATE_DOCUMENT', 'READ_DOCUMENT', 'UPDATE_DOCUMENT', 'DELETE_DOCUMENT', 'UPLOAD_DOCUMENT', 'MANAGE_ROLES', 'MANAGE_PERMISSIONS', 'VIEW_SYSTEM_STATS');

-- First, add the new columns with default values
ALTER TABLE "User" ADD COLUMN "email" VARCHAR(255);
ALTER TABLE "User" ADD COLUMN "name" VARCHAR(100);
ALTER TABLE "User" ADD COLUMN "surname" VARCHAR(100);
ALTER TABLE "User" ADD COLUMN "updated_at" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "is_active" BOOLEAN;
ALTER TABLE "User" ADD COLUMN "last_login" TIMESTAMP(3);

-- Update existing users with default values
UPDATE "User" SET 
  "email" = COALESCE("username", 'user@example.com'),
  "name" = 'Default',
  "surname" = 'User',
  "updated_at" = "created_at",
  "is_active" = true,
  "last_login" = NULL;

-- Now make the columns NOT NULL
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "surname" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "updated_at" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "is_active" SET NOT NULL;

-- Drop the old username column
ALTER TABLE "User" DROP COLUMN "username";

-- Drop the old role column and recreate it with the new enum
ALTER TABLE "User" DROP COLUMN "role";
ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "PermissionEntity" (
    "permission_id" SERIAL NOT NULL,
    "name" "Permission" NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PermissionEntity_pkey" PRIMARY KEY ("permission_id")
);

-- CreateTable
CREATE TABLE "Role" (
    "role_id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "UserPermission" (
    "user_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("user_id","permission_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PermissionEntity_name_key" ON "PermissionEntity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX "RolePermission_role_id_idx" ON "RolePermission"("role_id");

-- CreateIndex
CREATE INDEX "RolePermission_permission_id_idx" ON "RolePermission"("permission_id");

-- CreateIndex
CREATE INDEX "UserPermission_user_id_idx" ON "UserPermission"("user_id");

-- CreateIndex
CREATE INDEX "UserPermission_permission_id_idx" ON "UserPermission"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_is_active_idx" ON "User"("is_active");

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "PermissionEntity"("permission_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "PermissionEntity"("permission_id") ON DELETE CASCADE ON UPDATE CASCADE;
