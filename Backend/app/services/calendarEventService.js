import prisma from "../config/prisma.js";
import { AcademicYearService } from "./academicYearService.js";

const EVENT_TYPES = new Set(["EXAM", "BREAK", "HOLIDAY", "SPECIAL", "OTHER"]);

function requiredText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(value) {
  const text = requiredText(value);
  return text || null;
}

function toDto(event) {
  return {
    id: event.id,
    institutionId: event.institution_id,
    academicYearId: event.academic_year_id,
    siteId: event.site_id,
    title: event.title,
    description: event.description,
    eventType: event.event_type,
    startsAt: event.starts_at,
    endsAt: event.ends_at,
    allDay: event.all_day,
    color: event.color,
    emoji: event.emoji,
    imageUrl: event.image_url,
    createdAt: event.created_at,
    updatedAt: event.updated_at,
  };
}

export class CalendarEventService {
  static async list(actor, { institutionId, academicYearId, siteId }) {
    if (!institutionId) {
      return { error: "institutionId is required", status: 400 };
    }
    if (!AcademicYearService.canReadInstitution(actor, institutionId)) {
      return { error: "You do not have access to this action", status: 403 };
    }

    const where = {
      institution_id: institutionId,
      is_deleted: false,
      ...(academicYearId ? { academic_year_id: academicYearId } : {}),
    };

    if (siteId) {
      where.OR = [{ site_id: null }, { site_id: siteId }];
    } else if (actor.role === "SITE_ADMIN" && actor.siteId) {
      where.OR = [{ site_id: null }, { site_id: actor.siteId }];
    }

    const rows = await prisma.calendar_events.findMany({
      where,
      orderBy: { starts_at: "asc" },
    });
    return { data: rows.map(toDto) };
  }

  static async create(actor, body) {
    const institutionId = body?.institutionId;
    const academicYearId = body?.academicYearId;
    const title = requiredText(body?.title);
    if (!institutionId || !academicYearId || !title) {
      return {
        error: "institutionId, academicYearId and title are required",
        status: 400,
      };
    }
    if (!AcademicYearService.canWriteInstitution(actor, institutionId)) {
      return { error: "You do not have access to this action", status: 403 };
    }

    const year = await prisma.academic_years.findFirst({
      where: {
        id: academicYearId,
        institution_id: institutionId,
        is_deleted: false,
      },
    });
    if (!year) {
      return { error: "Academic year not found", status: 404 };
    }

    const eventType = requiredText(body?.eventType).toUpperCase() || "OTHER";
    if (!EVENT_TYPES.has(eventType)) {
      return { error: "eventType is not valid", status: 400 };
    }

    const startsAt = body?.startsAt ? new Date(body.startsAt) : null;
    const endsAt = body?.endsAt ? new Date(body.endsAt) : null;
    if (!startsAt || Number.isNaN(startsAt.getTime()) || !endsAt || Number.isNaN(endsAt.getTime())) {
      return { error: "startsAt and endsAt are required", status: 400 };
    }
    if (endsAt < startsAt) {
      return { error: "endsAt must be on or after startsAt", status: 400 };
    }

    let siteId = body?.siteId || null;
    if (siteId) {
      const site = await prisma.sites.findFirst({
        where: {
          id: siteId,
          institution_id: institutionId,
          is_deleted: false,
        },
        select: { id: true },
      });
      if (!site) {
        return { error: "Campus not found", status: 400 };
      }
    }

    const created = await prisma.calendar_events.create({
      data: {
        institution_id: institutionId,
        academic_year_id: academicYearId,
        site_id: siteId,
        title,
        description: optionalText(body?.description),
        event_type: eventType,
        starts_at: startsAt,
        ends_at: endsAt,
        all_day: body?.allDay !== false,
        color: optionalText(body?.color),
        emoji: optionalText(body?.emoji),
        image_url: optionalText(body?.imageUrl),
      },
    });
    return { data: toDto(created) };
  }

  static async update(actor, id, body) {
    const existing = await prisma.calendar_events.findFirst({
      where: { id, is_deleted: false },
    });
    if (!existing) {
      return { error: "Event not found", status: 404 };
    }
    if (!AcademicYearService.canWriteInstitution(actor, existing.institution_id)) {
      return { error: "You do not have access to this action", status: 403 };
    }

    const data = {};
    if (body?.title !== undefined) {
      const title = requiredText(body.title);
      if (!title) return { error: "title is required", status: 400 };
      data.title = title;
    }
    if (body?.description !== undefined) {
      data.description = optionalText(body.description);
    }
    if (body?.eventType !== undefined) {
      const eventType = requiredText(body.eventType).toUpperCase();
      if (!EVENT_TYPES.has(eventType)) {
        return { error: "eventType is not valid", status: 400 };
      }
      data.event_type = eventType;
    }
    if (body?.startsAt !== undefined) {
      const startsAt = new Date(body.startsAt);
      if (Number.isNaN(startsAt.getTime())) {
        return { error: "startsAt is invalid", status: 400 };
      }
      data.starts_at = startsAt;
    }
    if (body?.endsAt !== undefined) {
      const endsAt = new Date(body.endsAt);
      if (Number.isNaN(endsAt.getTime())) {
        return { error: "endsAt is invalid", status: 400 };
      }
      data.ends_at = endsAt;
    }
    if (body?.allDay !== undefined) {
      data.all_day = Boolean(body.allDay);
    }
    if (body?.color !== undefined) data.color = optionalText(body.color);
    if (body?.emoji !== undefined) data.emoji = optionalText(body.emoji);
    if (body?.imageUrl !== undefined) data.image_url = optionalText(body.imageUrl);
    if (body?.siteId !== undefined) {
      const siteId = body.siteId || null;
      if (siteId) {
        const site = await prisma.sites.findFirst({
          where: {
            id: siteId,
            institution_id: existing.institution_id,
            is_deleted: false,
          },
          select: { id: true },
        });
        if (!site) return { error: "Campus not found", status: 400 };
      }
      data.site_id = siteId;
    }
    if (body?.academicYearId !== undefined) {
      const year = await prisma.academic_years.findFirst({
        where: {
          id: body.academicYearId,
          institution_id: existing.institution_id,
          is_deleted: false,
        },
      });
      if (!year) return { error: "Academic year not found", status: 400 };
      data.academic_year_id = year.id;
    }

    const starts = data.starts_at ?? existing.starts_at;
    const ends = data.ends_at ?? existing.ends_at;
    if (ends < starts) {
      return { error: "endsAt must be on or after startsAt", status: 400 };
    }

    const updated = await prisma.calendar_events.update({
      where: { id },
      data,
    });
    return { data: toDto(updated) };
  }

  static async remove(actor, id) {
    const existing = await prisma.calendar_events.findFirst({
      where: { id, is_deleted: false },
    });
    if (!existing) {
      return { error: "Event not found", status: 404 };
    }
    if (!AcademicYearService.canWriteInstitution(actor, existing.institution_id)) {
      return { error: "You do not have access to this action", status: 403 };
    }
    await prisma.calendar_events.update({
      where: { id },
      data: { is_deleted: true },
    });
    return { data: { id } };
  }
}
