import prisma from "../config/prisma.js";
import { Role } from "../types/user.js";
import { AcademicYearService } from "./academicYearService.js";

function requiredText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function canManageCampus(actor, institutionId, siteId) {
  if (!actor || !siteId) return false;
  if (actor.role === Role.SYSTEM_ADMIN) return true;
  if (
    actor.role === Role.INSTITUTION_ADMIN &&
    actor.institutionId === institutionId
  ) {
    return true;
  }
  if (
    actor.role === Role.SITE_ADMIN &&
    actor.institutionId === institutionId &&
    actor.siteId === siteId
  ) {
    return true;
  }
  return false;
}

function toDto(row) {
  return {
    id: row.id,
    studentId: row.student_id,
    courseId: row.course_id,
    academicYearId: row.academic_year_id,
    institutionId: row.institution_id,
    firstName: row.student?.first_name ?? null,
    lastName: row.student?.last_name ?? null,
    studentPhone: row.student?.phone ?? null,
    studentIdNumber: row.student?.id_number ?? null,
    courseName: row.course?.name ?? null,
    academicYearName: row.academic_year?.name ?? null,
    createdAt: row.created_at,
  };
}

export class EnrollmentService {
  static canManageCampus = canManageCampus;

  static async list(actor, { institutionId, siteId, courseId, academicYearId }) {
    const institution = requiredText(institutionId);
    const campusId = requiredText(siteId);
    const course = requiredText(courseId);
    const yearId = requiredText(academicYearId);

    if (!institution) {
      return { error: "institutionId is required", status: 400 };
    }
    if (!AcademicYearService.canReadInstitution(actor, institution)) {
      return { error: "You do not have access to this action", status: 403 };
    }
    if (!course) {
      return { error: "courseId is required", status: 400 };
    }

    const courseRow = await prisma.courses.findFirst({
      where: { id: course, institution_id: institution, is_deleted: false },
      select: { id: true, site_id: true },
    });
    if (!courseRow) {
      return { error: "Course not found", status: 404 };
    }
    if (campusId && courseRow.site_id && courseRow.site_id !== campusId) {
      return { error: "Course is not on this campus", status: 400 };
    }

    const where = {
      is_deleted: false,
      institution_id: institution,
      course_id: course,
    };
    if (yearId) where.academic_year_id = yearId;
    if (campusId) {
      where.student = { site_id: campusId, is_deleted: false };
    }

    const rows = await prisma.student_enrollments.findMany({
      where,
      include: {
        student: {
          select: {
            first_name: true,
            last_name: true,
            phone: true,
            id_number: true,
            site_id: true,
          },
        },
        course: { select: { name: true } },
        academic_year: { select: { name: true } },
      },
      orderBy: { created_at: "asc" },
    });

    return { data: rows.map(toDto) };
  }

  static async create(actor, body) {
    const studentId = requiredText(body?.studentId);
    const courseId = requiredText(body?.courseId);
    const academicYearId = requiredText(body?.academicYearId);
    const siteId = requiredText(body?.siteId);

    if (!studentId || !courseId || !academicYearId || !siteId) {
      return {
        error: "studentId, courseId, academicYearId, and siteId are required",
        status: 400,
      };
    }

    const student = await prisma.students.findFirst({
      where: { id: studentId, is_deleted: false },
      select: {
        id: true,
        site_id: true,
        site: { select: { institution_id: true } },
      },
    });
    if (!student) {
      return { error: "Student not found", status: 404 };
    }
    if (student.site_id !== siteId) {
      return { error: "Student is not on this campus", status: 400 };
    }

    const institutionId = student.site.institution_id;
    if (!canManageCampus(actor, institutionId, siteId)) {
      return { error: "You do not have access to this action", status: 403 };
    }

    const course = await prisma.courses.findFirst({
      where: {
        id: courseId,
        institution_id: institutionId,
        is_deleted: false,
      },
      select: { id: true, site_id: true, name: true },
    });
    if (!course) {
      return { error: "Course not found", status: 404 };
    }
    if (course.site_id && course.site_id !== siteId) {
      return { error: "Course is not on this campus", status: 400 };
    }

    const year = await prisma.academic_years.findFirst({
      where: {
        id: academicYearId,
        institution_id: institutionId,
        is_deleted: false,
      },
      select: { id: true, name: true },
    });
    if (!year) {
      return { error: "Academic year not found", status: 404 };
    }

    const existing = await prisma.student_enrollments.findFirst({
      where: {
        student_id: studentId,
        course_id: courseId,
        academic_year_id: academicYearId,
      },
    });
    if (existing && !existing.is_deleted) {
      return { error: "Student is already enrolled", status: 409 };
    }

    let row;
    if (existing) {
      row = await prisma.student_enrollments.update({
        where: { id: existing.id },
        data: { is_deleted: false, updated_at: new Date() },
        include: {
          student: {
            select: {
              first_name: true,
              last_name: true,
              phone: true,
              id_number: true,
            },
          },
          course: { select: { name: true } },
          academic_year: { select: { name: true } },
        },
      });
    } else {
      row = await prisma.student_enrollments.create({
        data: {
          student_id: studentId,
          course_id: courseId,
          academic_year_id: academicYearId,
          institution_id: institutionId,
        },
        include: {
          student: {
            select: {
              first_name: true,
              last_name: true,
              phone: true,
              id_number: true,
            },
          },
          course: { select: { name: true } },
          academic_year: { select: { name: true } },
        },
      });
    }

    return { data: toDto(row) };
  }

  static async remove(actor, id, siteId) {
    const campusId = requiredText(siteId);
    if (!campusId) {
      return { error: "siteId is required", status: 400 };
    }

    const existing = await prisma.student_enrollments.findFirst({
      where: { id, is_deleted: false },
      include: {
        student: { select: { site_id: true, site: { select: { institution_id: true } } } },
      },
    });
    if (!existing) {
      return { error: "Enrollment not found", status: 404 };
    }
    if (existing.student.site_id !== campusId) {
      return { error: "Enrollment is not on this campus", status: 400 };
    }
    if (
      !canManageCampus(
        actor,
        existing.student.site.institution_id,
        campusId
      )
    ) {
      return { error: "You do not have access to this action", status: 403 };
    }

    await prisma.student_enrollments.update({
      where: { id },
      data: { is_deleted: true, updated_at: new Date() },
    });
    return { data: { id } };
  }
}
