import { randomBytes } from "node:crypto";
import prisma from "../config/prisma.js";
import { Role } from "../types/user.js";
import { WahaService } from "./wahaService.js";

const STAFF_STATUSES = ["IN_PROGRESS", "WAITING", "DONE"];

function wahaMessageId(value) {
  if (value == null) return null;
  if (typeof value === "string") return value || null;
  if (typeof value === "object") {
    if (typeof value._serialized === "string") return value._serialized;
    if (typeof value.id === "string") return value.id;
  }
  return null;
}

function generateTicketCode() {
  return `SUP-${randomBytes(3).toString("hex").toUpperCase()}`;
}

async function nextTicketCode(tx = prisma) {
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = generateTicketCode();
    const existing = await tx.support_tickets.findUnique({
      where: { code },
      select: { id: true },
    });
    if (!existing) {
      return code;
    }
  }
  return `SUP-${Date.now().toString(36).toUpperCase()}`;
}

function ticketDto(ticket) {
  return {
    id: ticket.id,
    siteId: ticket.site_id,
    chatId: ticket.chat_id,
    code: ticket.code,
    status: ticket.status,
    preview: ticket.preview,
    openedAt: ticket.opened_at,
    createdAt: ticket.created_at,
    updatedAt: ticket.updated_at,
  };
}

function messageDto(message) {
  return {
    id: message.id,
    direction: message.direction,
    body: message.body,
    wahaMessageId: message.waha_message_id,
    createdAt: message.created_at,
  };
}

export class SupportService {
  static async accessibleSite(actor, siteId) {
    const site = await prisma.sites.findFirst({
      where: { id: siteId, is_deleted: false },
      select: { id: true, institution_id: true },
    });
    if (!site) {
      return null;
    }
    if (actor.role === Role.SYSTEM_ADMIN) {
      return site;
    }
    if (actor.role === Role.SITE_ADMIN && actor.siteId === site.id) {
      return site;
    }
    if (
      actor.role === Role.INSTITUTION_ADMIN &&
      actor.institutionId &&
      actor.institutionId === site.institution_id
    ) {
      return site;
    }
    return null;
  }

  static ticketScope(actor, siteId) {
    if (actor.role === Role.SYSTEM_ADMIN) {
      return siteId ? { site_id: siteId } : {};
    }
    if (actor.role === Role.SITE_ADMIN) {
      if (!actor.siteId || (siteId && siteId !== actor.siteId)) {
        return null;
      }
      return { site_id: actor.siteId };
    }
    if (actor.role === Role.INSTITUTION_ADMIN) {
      if (!actor.institutionId) {
        return null;
      }
      return {
        site: { institution_id: actor.institutionId, is_deleted: false },
        ...(siteId ? { site_id: siteId } : {}),
      };
    }
    return null;
  }

  static async startSession(actor, siteId) {
    if (!siteId) {
      return { error: "siteId is required", status: 400 };
    }
    const site = await this.accessibleSite(actor, siteId);
    if (!site) {
      return { error: "Campus not found", status: 404 };
    }

    const sessionName = WahaService.sessionName(site.id);
    const started = await WahaService.createOrStartSession(sessionName);
    if (started.error) {
      return started;
    }

    await prisma.site_whatsapp.upsert({
      where: { site_id: site.id },
      update: { session_name: sessionName, is_deleted: false },
      create: { site_id: site.id, session_name: sessionName },
    });

    return { data: { sessionName } };
  }

  static async getQr(actor, siteId) {
    const site = await this.accessibleSite(actor, siteId);
    if (!site) {
      return { error: "Campus not found", status: 404 };
    }
    const row = await prisma.site_whatsapp.findFirst({
      where: { site_id: site.id, is_deleted: false },
    });
    if (!row) {
      return {
        error: "Start the WhatsApp session first, then load the QR code.",
        status: 404,
      };
    }
    return WahaService.getQr(row.session_name);
  }

  static async receiveWebhook(body) {
    if (body?.event !== "message") {
      return { ignored: true };
    }
    const payload = body.payload || {};
    if (payload.fromMe) {
      return { ignored: true };
    }
    const text = typeof payload.body === "string" ? payload.body.trim() : "";
    const chatId = payload.from;
    const sessionName = body.session;
    if (!text || !chatId || !sessionName) {
      return { ignored: true };
    }

    const link = await prisma.site_whatsapp.findFirst({
      where: { session_name: sessionName, is_deleted: false },
    });
    if (!link) {
      return { ignored: true };
    }

    const preview = text.slice(0, 200);
    const messageData = {
      direction: "INBOUND",
      body: text,
      waha_message_id: wahaMessageId(payload.id),
    };

    try {
      await prisma.$transaction(async (tx) => {
        const existing = await tx.support_tickets.findFirst({
          where: {
            site_id: link.site_id,
            chat_id: chatId,
            status: { not: "DONE" },
          },
        });
        if (existing) {
          await tx.support_messages.create({
            data: { ticket_id: existing.id, ...messageData },
          });
          await tx.support_tickets.update({
            where: { id: existing.id },
            data: { preview },
          });
          return;
        }
        const code = await nextTicketCode(tx);
        await tx.support_tickets.create({
          data: {
            site_id: link.site_id,
            chat_id: chatId,
            code,
            status: "OPEN",
            preview,
            messages: { create: messageData },
          },
        });
      });
    } catch (error) {
      if (error.code !== "P2002") {
        throw error;
      }
      const existing = await prisma.support_tickets.findFirst({
        where: {
          site_id: link.site_id,
          chat_id: chatId,
          status: { not: "DONE" },
        },
      });
      if (!existing) {
        throw error;
      }
      await prisma.support_messages.create({
        data: { ticket_id: existing.id, ...messageData },
      });
    }

    return { stored: true };
  }

  static async list(actor, { siteId, status }) {
    if (status && !["OPEN", "IN_PROGRESS", "WAITING", "DONE"].includes(status)) {
      return { error: "Status is not valid", status: 400 };
    }
    if (siteId) {
      const site = await this.accessibleSite(actor, siteId);
      if (!site) {
        return { error: "Ticket not found", status: 404 };
      }
    }
    const scope = this.ticketScope(actor, siteId);
    if (!scope) {
      return { data: [] };
    }

    const tickets = await prisma.support_tickets.findMany({
      where: { ...scope, ...(status ? { status } : {}) },
      orderBy: { updated_at: "desc" },
    });
    return { data: tickets.map(ticketDto) };
  }

  static async open(actor, id) {
    const scope = this.ticketScope(actor);
    if (!scope) {
      return { error: "Ticket not found", status: 404 };
    }
    const ticket = await prisma.support_tickets.findFirst({
      where: { id, ...scope },
      include: { messages: { orderBy: { created_at: "asc" } } },
    });
    if (!ticket) {
      return { error: "Ticket not found", status: 404 };
    }

    let current = ticket;
    if (ticket.status === "OPEN") {
      current = await prisma.support_tickets.update({
        where: { id: ticket.id },
        data: { status: "IN_PROGRESS", opened_at: new Date() },
        include: { messages: { orderBy: { created_at: "asc" } } },
      });
    }

    return {
      data: {
        ...ticketDto(current),
        messages: current.messages.map(messageDto),
      },
    };
  }

  static async updateStatus(actor, id, status) {
    if (!STAFF_STATUSES.includes(status)) {
      return { error: "Status is not valid", status: 400 };
    }
    const scope = this.ticketScope(actor);
    if (!scope) {
      return { error: "Ticket not found", status: 404 };
    }
    const ticket = await prisma.support_tickets.findFirst({
      where: { id, ...scope },
    });
    if (!ticket) {
      return { error: "Ticket not found", status: 404 };
    }
    const updated = await prisma.support_tickets.update({
      where: { id: ticket.id },
      data: {
        status,
        ...(status === "IN_PROGRESS" && !ticket.opened_at
          ? { opened_at: new Date() }
          : {}),
      },
    });
    return { data: ticketDto(updated) };
  }

  static async reply(actor, id, text) {
    const trimmed = typeof text === "string" ? text.trim() : "";
    if (!trimmed) {
      return { error: "Text is required", status: 400 };
    }
    const scope = this.ticketScope(actor);
    if (!scope) {
      return { error: "Ticket not found", status: 404 };
    }
    const ticket = await prisma.support_tickets.findFirst({
      where: { id, ...scope },
    });
    if (!ticket) {
      return { error: "Ticket not found", status: 404 };
    }
    const link = await prisma.site_whatsapp.findFirst({
      where: { site_id: ticket.site_id, is_deleted: false },
    });
    if (!link) {
      return { error: "Campus not found", status: 404 };
    }

    const sent = await WahaService.sendText({
      sessionName: link.session_name,
      chatId: ticket.chat_id,
      text: trimmed,
    });
    if (sent.error) {
      return { error: sent.error, status: 502 };
    }

    const message = await prisma.support_messages.create({
      data: {
        ticket_id: ticket.id,
        direction: "OUTBOUND",
        body: trimmed,
        waha_message_id: wahaMessageId(sent.data?.id ?? sent.data?.key?.id),
      },
    });
    return { data: messageDto(message) };
  }
}
