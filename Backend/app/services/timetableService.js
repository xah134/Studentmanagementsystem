import prisma from "../config/prisma.js";
import { AcademicYearService } from "./academicYearService.js";

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

function requiredText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(value) {
  const text = requiredText(value);
  return text || null;
}

function toDto(slot) {
  return {
    id: slot.id,
    institutionId: slot.institution_id,
    courseId: slot.course_id,
    moduleId: slot.module_id,
    moduleName: slot.module?.name ?? null,
    siteId: slot.site_id,
    dayOfWeek: slot.day_of_week,
    startsAt: slot.starts_at,
    endsAt: slot.ends_at,
    title: slot.title,
    location: slot.location,
    color: slot.color,
    emoji: slot.emoji,
    imageUrl: slot.image_url,
    createdAt: slot.created_at,
    updatedAt: slot.updated_at,
  };
}

function validTime(value) {
  return typeof value === "string" && TIME_RE.test(value.trim());
}

function timeToMinutes(value) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

export class TimetableService {
  static async listByCourse(actor, courseId) {
    const course = await prisma.courses.findFirst({
      where: { id: courseId, is_deleted: false },
      select: { id: true, institution_id: true },
    });
    if (!course) {
      return { error: "Course not found", status: 404 };
    }
    if (!AcademicYearService.canReadInstitution(actor, course.institution_id)) {
      return { error: "You do not have access to this action", status: 403 };
    }

    const rows = await prisma.timetable_slots.findMany({
      where: { course_id: courseId, is_deleted: false },
      include: { module: { select: { name: true } } },
      orderBy: [{ day_of_week: "asc" }, { starts_at: "asc" }],
    });
    return { data: rows.map(toDto) };
  }

  static async create(actor, courseId, body) {
    const course = await prisma.courses.findFirst({
      where: { id: courseId, is_deleted: false },
      select: { id: true, institution_id: true },
    });
    if (!course) {
      return { error: "Course not found", status: 404 };
    }
    if (!AcademicYearService.canWriteInstitution(actor, course.institution_id)) {
      return { error: "You do not have access to this action", status: 403 };
    }

    const moduleId = body?.moduleId;
    if (!moduleId) {
      return { error: "moduleId is required", status: 400 };
    }
    const module = await prisma.modules.findFirst({
      where: {
        id: moduleId,
        course_id: courseId,
        is_deleted: false,
      },
      select: { id: true, name: true },
    });
    if (!module) {
      return { error: "Module not found on this course", status: 400 };
    }

    const dayOfWeek = Number(body?.dayOfWeek);
    if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      return { error: "dayOfWeek must be 0–6 (Sunday–Saturday)", status: 400 };
    }

    const startsAt = requiredText(body?.startsAt);
    const endsAt = requiredText(body?.endsAt);
    if (!validTime(startsAt) || !validTime(endsAt)) {
      return { error: "startsAt and endsAt must be HH:mm", status: 400 };
    }
    if (timeToMinutes(endsAt) <= timeToMinutes(startsAt)) {
      return { error: "endsAt must be after startsAt", status: 400 };
    }

    let siteId = body?.siteId || null;
    if (siteId) {
      const site = await prisma.sites.findFirst({
        where: {
          id: siteId,
          institution_id: course.institution_id,
          is_deleted: false,
        },
        select: { id: true },
      });
      if (!site) return { error: "Campus not found", status: 400 };
    }

    const created = await prisma.timetable_slots.create({
      data: {
        institution_id: course.institution_id,
        course_id: courseId,
        module_id: moduleId,
        site_id: siteId,
        day_of_week: dayOfWeek,
        starts_at: startsAt,
        ends_at: endsAt,
        title: optionalText(body?.title),
        location: optionalText(body?.location),
        color: optionalText(body?.color),
        emoji: optionalText(body?.emoji),
        image_url: optionalText(body?.imageUrl),
      },
      include: { module: { select: { name: true } } },
    });
    return { data: toDto(created) };
  }

  static async update(actor, id, body) {
    const existing = await prisma.timetable_slots.findFirst({
      where: { id, is_deleted: false },
      include: { module: { select: { name: true } } },
    });
    if (!existing) {
      return { error: "Timetable slot not found", status: 404 };
    }
    if (!AcademicYearService.canWriteInstitution(actor, existing.institution_id)) {
      return { error: "You do not have access to this action", status: 403 };
    }

    const data = {};
    if (body?.moduleId !== undefined) {
      const module = await prisma.modules.findFirst({
        where: {
          id: body.moduleId,
          course_id: existing.course_id,
          is_deleted: false,
        },
        select: { id: true },
      });
      if (!module) {
        return { error: "Module not found on this course", status: 400 };
      }
      data.module_id = module.id;
    }
    if (body?.dayOfWeek !== undefined) {
      const dayOfWeek = Number(body.dayOfWeek);
      if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
        return { error: "dayOfWeek must be 0–6 (Sunday–Saturday)", status: 400 };
      }
      data.day_of_week = dayOfWeek;
    }
    if (body?.startsAt !== undefined) {
      const startsAt = requiredText(body.startsAt);
      if (!validTime(startsAt)) {
        return { error: "startsAt must be HH:mm", status: 400 };
      }
      data.starts_at = startsAt;
    }
    if (body?.endsAt !== undefined) {
      const endsAt = requiredText(body.endsAt);
      if (!validTime(endsAt)) {
        return { error: "endsAt must be HH:mm", status: 400 };
      }
      data.ends_at = endsAt;
    }
    const starts = data.starts_at ?? existing.starts_at;
    const ends = data.ends_at ?? existing.ends_at;
    if (timeToMinutes(ends) <= timeToMinutes(starts)) {
      return { error: "endsAt must be after startsAt", status: 400 };
    }
    if (body?.title !== undefined) data.title = optionalText(body.title);
    if (body?.location !== undefined) data.location = optionalText(body.location);
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

    const updated = await prisma.timetable_slots.update({
      where: { id },
      data,
      include: { module: { select: { name: true } } },
    });
    return { data: toDto(updated) };
  }

  static async remove(actor, id) {
    const existing = await prisma.timetable_slots.findFirst({
      where: { id, is_deleted: false },
    });
    if (!existing) {
      return { error: "Timetable slot not found", status: 404 };
    }
    if (!AcademicYearService.canWriteInstitution(actor, existing.institution_id)) {
      return { error: "You do not have access to this action", status: 403 };
    }
    await prisma.timetable_slots.update({
      where: { id },
      data: { is_deleted: true },
    });
    return { data: { id } };
  }
}
