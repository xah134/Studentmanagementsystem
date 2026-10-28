import prisma from "../config/prisma.js";
import { AcademicYearService } from "./academicYearService.js";
import { EnrollmentService } from "./enrollmentService.js";

const STATUSES = new Set(["PRESENT", "ABSENT"]);

function requiredText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parseDateOnly(value) {
  const text = requiredText(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  const date = new Date(`${text}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function weekdayUtc(date) {
  return date.getUTCDay();
}

export class AttendanceService {
  static async getRoster(actor, { timetableSlotId, date, siteId }) {
    const slotId = requiredText(timetableSlotId);
    const campusId = requiredText(siteId);
    const attendanceDate = parseDateOnly(date);

    if (!slotId || !campusId || !attendanceDate) {
      return {
        error: "timetableSlotId, date (YYYY-MM-DD), and siteId are required",
        status: 400,
      };
    }

    const slot = await prisma.timetable_slots.findFirst({
      where: { id: slotId, is_deleted: false },
      include: {
        module: { select: { id: true, name: true, code: true } },
        course: {
          select: {
            id: true,
            name: true,
            site_id: true,
            institution_id: true,
          },
        },
      },
    });
    if (!slot) {
      return { error: "Timetable slot not found", status: 404 };
    }
    if (!AcademicYearService.canReadInstitution(actor, slot.institution_id)) {
      return { error: "You do not have access to this action", status: 403 };
    }
    if (slot.course.site_id && slot.course.site_id !== campusId) {
      return { error: "Slot course is not on this campus", status: 400 };
    }
    if (slot.site_id && slot.site_id !== campusId) {
      return { error: "Slot is not on this campus", status: 400 };
    }
    if (slot.day_of_week !== weekdayUtc(attendanceDate)) {
      return {
        error: "Selected date does not match this slot's day of week",
        status: 400,
      };
    }

    const year = await prisma.academic_years.findFirst({
      where: {
        institution_id: slot.institution_id,
        is_deleted: false,
        starts_on: { lte: attendanceDate },
        ends_on: { gte: attendanceDate },
      },
      orderBy: { starts_on: "desc" },
      select: { id: true, name: true },
    });

    const enrollmentWhere = {
      is_deleted: false,
      course_id: slot.course_id,
      institution_id: slot.institution_id,
      student: { site_id: campusId, is_deleted: false },
    };
    if (year) enrollmentWhere.academic_year_id = year.id;

    const enrollments = await prisma.student_enrollments.findMany({
      where: enrollmentWhere,
      include: {
        student: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            phone: true,
            id_number: true,
            verification_status: true,
          },
        },
      },
      orderBy: { created_at: "asc" },
    });

    const marks = await prisma.attendance_records.findMany({
      where: {
        timetable_slot_id: slotId,
        attendance_date: attendanceDate,
        is_deleted: false,
        student_id: { in: enrollments.map((e) => e.student_id) },
      },
      select: { student_id: true, status: true, id: true },
    });
    const markByStudent = new Map(marks.map((m) => [m.student_id, m]));

    return {
      data: {
        slot: {
          id: slot.id,
          courseId: slot.course_id,
          courseName: slot.course.name,
          moduleId: slot.module_id,
          moduleName: slot.module?.name ?? null,
          moduleCode: slot.module?.code ?? null,
          dayOfWeek: slot.day_of_week,
          startsAt: slot.starts_at,
          endsAt: slot.ends_at,
          location: slot.location,
          title: slot.title,
        },
        date: date,
        academicYearId: year?.id ?? null,
        academicYearName: year?.name ?? null,
        roster: enrollments.map((enrollment) => {
          const mark = markByStudent.get(enrollment.student_id);
          return {
            enrollmentId: enrollment.id,
            studentId: enrollment.student_id,
            firstName: enrollment.student.first_name,
            lastName: enrollment.student.last_name,
            phone: enrollment.student.phone,
            idNumber: enrollment.student.id_number,
            verificationStatus: enrollment.student.verification_status,
            status: mark?.status ?? null,
            attendanceRecordId: mark?.id ?? null,
          };
        }),
      },
    };
  }

  static async bulkUpsert(actor, body) {
    const slotId = requiredText(body?.timetableSlotId);
    const campusId = requiredText(body?.siteId);
    const attendanceDate = parseDateOnly(body?.date);
    const marks = Array.isArray(body?.marks) ? body.marks : null;

    if (!slotId || !campusId || !attendanceDate || !marks) {
      return {
        error: "timetableSlotId, siteId, date, and marks[] are required",
        status: 400,
      };
    }

    const slot = await prisma.timetable_slots.findFirst({
      where: { id: slotId, is_deleted: false },
      include: {
        course: {
          select: { id: true, site_id: true, institution_id: true },
        },
      },
    });
    if (!slot) {
      return { error: "Timetable slot not found", status: 404 };
    }
    if (
      !EnrollmentService.canManageCampus(
        actor,
        slot.institution_id,
        campusId
      )
    ) {
      return { error: "You do not have access to this action", status: 403 };
    }
    if (slot.course.site_id && slot.course.site_id !== campusId) {
      return { error: "Slot course is not on this campus", status: 400 };
    }
    if (slot.site_id && slot.site_id !== campusId) {
      return { error: "Slot is not on this campus", status: 400 };
    }
    if (slot.day_of_week !== weekdayUtc(attendanceDate)) {
      return {
        error: "Selected date does not match this slot's day of week",
        status: 400,
      };
    }

    const normalized = [];
    for (const mark of marks) {
      const studentId = requiredText(mark?.studentId);
      const status = requiredText(mark?.status).toUpperCase();
      if (!studentId || !STATUSES.has(status)) {
        return {
          error: "Each mark needs studentId and status PRESENT|ABSENT",
          status: 400,
        };
      }
      normalized.push({ studentId, status });
    }

    const studentIds = [...new Set(normalized.map((m) => m.studentId))];
    const enrolled = await prisma.student_enrollments.findMany({
      where: {
        is_deleted: false,
        course_id: slot.course_id,
        student_id: { in: studentIds },
        student: { site_id: campusId, is_deleted: false },
      },
      select: { student_id: true },
    });
    const enrolledSet = new Set(enrolled.map((e) => e.student_id));
    for (const id of studentIds) {
      if (!enrolledSet.has(id)) {
        return { error: "Student is not enrolled in this course", status: 400 };
      }
    }

    await prisma.$transaction(
      normalized.map(({ studentId, status }) =>
        prisma.attendance_records.upsert({
          where: {
            student_id_timetable_slot_id_attendance_date: {
              student_id: studentId,
              timetable_slot_id: slotId,
              attendance_date: attendanceDate,
            },
          },
          create: {
            student_id: studentId,
            timetable_slot_id: slotId,
            attendance_date: attendanceDate,
            status,
          },
          update: {
            status,
            is_deleted: false,
            updated_at: new Date(),
          },
        })
      )
    );

    return AttendanceService.getRoster(actor, {
      timetableSlotId: slotId,
      date: body.date,
      siteId: campusId,
    });
  }
}
