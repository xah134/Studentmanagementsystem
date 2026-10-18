-- DropForeignKey
ALTER TABLE "lecturers" DROP CONSTRAINT "lecturers_site_id_fkey";

-- DropForeignKey
ALTER TABLE "lecturers" DROP CONSTRAINT "lecturers_user_id_fkey";

-- AlterTable
ALTER TABLE "lecturers" ADD COLUMN     "department_id" TEXT,
ADD COLUMN     "institution_id" TEXT,
ALTER COLUMN "site_id" DROP NOT NULL,
ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "lecturers" ADD CONSTRAINT "lecturers_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturers" ADD CONSTRAINT "lecturers_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturers" ADD CONSTRAINT "lecturers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
