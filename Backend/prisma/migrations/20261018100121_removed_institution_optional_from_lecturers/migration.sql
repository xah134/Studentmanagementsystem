/*
  Warnings:

  - Made the column `institution_id` on table `lecturers` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "lecturers" DROP CONSTRAINT "lecturers_institution_id_fkey";

-- AlterTable
ALTER TABLE "lecturers" ALTER COLUMN "institution_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "lecturers" ADD CONSTRAINT "lecturers_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
