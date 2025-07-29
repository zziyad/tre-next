/*
  Warnings:

  - You are about to drop the column `answer` on the `TransportReport` table. All the data in the column will be lost.
  - You are about to drop the column `question` on the `TransportReport` table. All the data in the column will be lost.
  - Added the required column `email` to the `TransportReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `TransportReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `report_date` to the `TransportReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `surname` to the `TransportReport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TransportReport" DROP COLUMN "answer",
DROP COLUMN "question",
ADD COLUMN     "email" VARCHAR(255) NOT NULL,
ADD COLUMN     "issues_encountered" TEXT,
ADD COLUMN     "meetings_attended" TEXT,
ADD COLUMN     "name" VARCHAR(255) NOT NULL,
ADD COLUMN     "pending_tasks" TEXT,
ADD COLUMN     "report_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "support_notes" TEXT,
ADD COLUMN     "surname" VARCHAR(255) NOT NULL,
ADD COLUMN     "tasks_completed" TEXT;
