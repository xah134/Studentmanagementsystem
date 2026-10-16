-- CreateEnum
CREATE TYPE "SupportTicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING', 'DONE');

-- CreateEnum
CREATE TYPE "SupportMessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateTable
CREATE TABLE "site_whatsapp" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "session_name" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_whatsapp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "status" "SupportTicketStatus" NOT NULL DEFAULT 'OPEN',
    "preview" TEXT,
    "opened_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_messages" (
    "id" TEXT NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "direction" "SupportMessageDirection" NOT NULL,
    "body" TEXT NOT NULL,
    "waha_message_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "site_whatsapp_site_id_key" ON "site_whatsapp"("site_id");

-- CreateIndex
CREATE UNIQUE INDEX "site_whatsapp_session_name_key" ON "site_whatsapp"("session_name");

-- CreateIndex
CREATE INDEX "support_tickets_site_id_chat_id_idx" ON "support_tickets"("site_id", "chat_id");

-- One open ticket per campus chat. Done tickets can repeat.
CREATE UNIQUE INDEX "support_tickets_one_open_chat" ON "support_tickets"("site_id", "chat_id") WHERE "status" <> 'DONE';

-- CreateIndex
CREATE INDEX "support_messages_ticket_id_idx" ON "support_messages"("ticket_id");

-- AddForeignKey
ALTER TABLE "site_whatsapp" ADD CONSTRAINT "site_whatsapp_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
