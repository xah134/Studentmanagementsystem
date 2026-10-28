import prisma from "../config/prisma.js";
import { Role } from "../types/user.js";

function requiredText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toDto(year) {
  return {
    id: year.id,
    institutionId: year.institution_id,
    name: year.name,
    startsOn: year.starts_on,
    endsOn: year.ends_on,
    createdAt: year.created_at,
  };
}

function canReadInstitution(actor, institutionId) {
  if (!actor) return false;
  if (actor.role === Role.SYSTEM_ADMIN) return true;
  if (
    (actor.role === Role.INSTITUTION_ADMIN || actor.role === Role.SITE_ADMIN) &&
    actor.institutionId === institutionId
  ) {
    return true;
  }
  return false;
}

function canWriteInstitution(actor, institutionId) {
  if (!actor) return false;
  if (actor.role === Role.SYSTEM_ADMIN) return true;
  if (actor.role === Role.INSTITUTION_ADMIN && actor.institutionId === institutionId) {
    return true;
  }
  return false;
}

export class AcademicYearService {
  static canReadInstitution = canReadInstitution;
  static canWriteInstitution = canWriteInstitution;

  static async list(actor, institutionId) {
    if (!institutionId) {
      return { error: "institutionId is required", status: 400 };
    }
    if (!canReadInstitution(actor, institutionId)) {
      return { error: "You do not have access to this action", status: 403 };
    }
    const rows = await prisma.academic_years.findMany({
      where: { institution_id: institutionId, is_deleted: false },
      orderBy: { starts_on: "desc" },
    });
    return { data: rows.map(toDto) };
  }

  static async create(actor, body) {
    const institutionId = body?.institutionId;
    const name = requiredText(body?.name);
    if (!institutionId || !name) {
      return { error: "institutionId and name are required", status: 400 };
    }
    if (!canWriteInstitution(actor, institutionId)) {
      return { error: "You do not have access to this action", status: 403 };
    }
    const startsOn = body?.startsOn ? new Date(body.startsOn) : null;
    const endsOn = body?.endsOn ? new Date(body.endsOn) : null;
    if (!startsOn || Number.isNaN(startsOn.getTime()) || !endsOn || Number.isNaN(endsOn.getTime())) {
      return { error: "startsOn and endsOn are required", status: 400 };
    }
    if (endsOn < startsOn) {
      return { error: "endsOn must be on or after startsOn", status: 400 };
    }

    const institution = await prisma.institutions.findFirst({
      where: { id: institutionId, is_deleted: false },
      select: { id: true },
    });
    if (!institution) {
      return { error: "Institution not found", status: 404 };
    }

    try {
      const created = await prisma.academic_years.create({
        data: {
          institution_id: institutionId,
          name,
          starts_on: startsOn,
          ends_on: endsOn,
        },
      });
      return { data: toDto(created) };
    } catch (err) {
      if (err.code === "P2002") {
        return { error: "An academic year with that name already exists", status: 409 };
      }
      throw err;
    }
  }

  static async update(actor, id, body) {
    const existing = await prisma.academic_years.findFirst({
      where: { id, is_deleted: false },
    });
    if (!existing) {
      return { error: "Academic year not found", status: 404 };
    }
    if (!canWriteInstitution(actor, existing.institution_id)) {
      return { error: "You do not have access to this action", status: 403 };
    }

    const data = {};
    if (body?.name !== undefined) {
      const name = requiredText(body.name);
      if (!name) return { error: "name is required", status: 400 };
      data.name = name;
    }
    if (body?.startsOn !== undefined) {
      const startsOn = new Date(body.startsOn);
      if (Number.isNaN(startsOn.getTime())) {
        return { error: "startsOn is invalid", status: 400 };
      }
      data.starts_on = startsOn;
    }
    if (body?.endsOn !== undefined) {
      const endsOn = new Date(body.endsOn);
      if (Number.isNaN(endsOn.getTime())) {
        return { error: "endsOn is invalid", status: 400 };
      }
      data.ends_on = endsOn;
    }
    const starts = data.starts_on ?? existing.starts_on;
    const ends = data.ends_on ?? existing.ends_on;
    if (ends < starts) {
      return { error: "endsOn must be on or after startsOn", status: 400 };
    }

    try {
      const updated = await prisma.academic_years.update({
        where: { id },
        data,
      });
      return { data: toDto(updated) };
    } catch (err) {
      if (err.code === "P2002") {
        return { error: "An academic year with that name already exists", status: 409 };
      }
      throw err;
    }
  }

  static async remove(actor, id) {
    const existing = await prisma.academic_years.findFirst({
      where: { id, is_deleted: false },
    });
    if (!existing) {
      return { error: "Academic year not found", status: 404 };
    }
    if (!canWriteInstitution(actor, existing.institution_id)) {
      return { error: "You do not have access to this action", status: 403 };
    }
    await prisma.academic_years.update({
      where: { id },
      data: { is_deleted: true },
    });
    return { data: { id } };
  }
}
