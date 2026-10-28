-- AlterTable
ALTER TABLE "support_tickets" ADD COLUMN "code" TEXT;

-- Backfill existing rows with stable codes
UPDATE "support_tickets"
SET "code" = 'SUP-' || upper(substr(replace(id::text, '-', ''), 1, 6))
WHERE "code" IS NULL;

-- Enforce uniqueness going forward
ALTER TABLE "support_tickets" ALTER COLUMN "code" SET NOT NULL;
CREATE UNIQUE INDEX "support_tickets_code_key" ON "support_tickets"("code");
