import prisma from '../config/prisma.js';

const GENDERS = ['MALE', 'FEMALE'];
const VERIFICATION_STATUSES = ['PENDING', 'VERIFIED', 'REJECTED'];

function requiredText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function optionalText(value) {
  const text = requiredText(value);
  return text || null;
}

function textField(body, key) {
  if (body?.[key] === undefined) return undefined;
  return optionalText(body[key]);
}

function toDateOnly(date) {
  return date ? date.toISOString().slice(0, 10) : null;
}

const detailSelect = {
  id: true,
  first_name: true,
  last_name: true,
  phone: true,
  foreign_national: true,
  passport_number: true,
  id_number: true,
  date_of_birth: true,
  gender: true,
  nationality: true,
  address: true,
  city: true,
  state: true,
  zip: true,
  country: true,
  site_id: true,
  verification_status: true,
  created_at: true,
  site: { select: { name: true, institution_id: true } },
  guardians: {
    orderBy: { created_at: 'asc' },
    select: { id: true, name: true, relationship: true, phone: true, email: true },
  },
};

function toListItem(student) {
  return {
    id: student.id,
    firstName: student.first_name,
    lastName: student.last_name,
    phone: student.phone,
    nationality: student.nationality,
    idNumber: student.id_number,
    siteId: student.site_id,
    siteName: student.site?.name ?? null,
    verificationStatus: student.verification_status,
    guardianCount: student._count?.guardians ?? 0,
    createdAt: student.created_at,
  };
}

function toDetail(student) {
  return {
    id: student.id,
    firstName: student.first_name,
    lastName: student.last_name,
    phone: student.phone,
    foreignNational: student.foreign_national,
    passportNumber: student.passport_number,
    idNumber: student.id_number,
    dateOfBirth: toDateOnly(student.date_of_birth),
    gender: student.gender,
    nationality: student.nationality,
    address: student.address,
    city: student.city,
    state: student.state,
    zip: student.zip,
    country: student.country,
    institutionId: student.site?.institution_id ?? null,
    siteId: student.site_id,
    siteName: student.site?.name ?? null,
    verificationStatus: student.verification_status,
    guardians: (student.guardians ?? []).map((guardian) => ({
      id: guardian.id,
      name: guardian.name,
      relationship: guardian.relationship,
      phone: guardian.phone,
      email: guardian.email,
    })),
    createdAt: student.created_at,
  };
}

function parseGuardians(value) {
  if (value === undefined) return { value: undefined };
  if (value === null) return { value: [] };
  if (!Array.isArray(value)) {
    return { error: 'Guardians must be a list', status: 400 };
  }

  const guardians = [];
  for (const item of value) {
    const name = requiredText(item?.name);
    if (!name) return { error: 'Guardian name is required', status: 400 };
    const relationship = requiredText(item?.relationship);
    if (!relationship) {
      return { error: 'Guardian relationship is required', status: 400 };
    }
    guardians.push({
      name,
      relationship,
      phone: optionalText(item?.phone),
      email: optionalText(item?.email),
    });
  }
  return { value: guardians };
}

function parseBody(body) {
  const institutionId = requiredText(body?.institutionId);
  if (!institutionId) {
    return { error: 'Institution is required', status: 400 };
  }
  const siteId = requiredText(body?.siteId);
  if (!siteId) {
    return { error: 'Campus is required', status: 400 };
  }

  let gender;
  if (body?.gender !== undefined) {
    const value = body.gender === null ? '' : requiredText(body.gender);
    if (value && !GENDERS.includes(value)) {
      return { error: 'Gender must be MALE or FEMALE', status: 400 };
    }
    gender = value || null;
  }

  let verificationStatus;
  if (body?.verificationStatus !== undefined && body.verificationStatus !== null) {
    const value = requiredText(body.verificationStatus);
    if (value) {
      if (!VERIFICATION_STATUSES.includes(value)) {
        return {
          error: 'Verification status must be PENDING, VERIFIED, or REJECTED',
          status: 400,
        };
      }
      verificationStatus = value;
    }
  }

  let foreignNational;
  if (body?.foreignNational !== undefined) {
    if (typeof body.foreignNational !== 'boolean') {
      return { error: 'Foreign national must be true or false', status: 400 };
    }
    foreignNational = body.foreignNational;
  }

  let dateOfBirth;
  if (body?.dateOfBirth !== undefined) {
    const value = body.dateOfBirth === null ? '' : requiredText(body.dateOfBirth);
    if (!value) {
      dateOfBirth = null;
    } else {
      const parsed = new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
      if (!/^\d{4}-\d{2}-\d{2}/.test(value) || Number.isNaN(parsed.getTime())) {
        return { error: 'Date of birth is not valid', status: 400 };
      }
      dateOfBirth = parsed;
    }
  }

  const guardians = parseGuardians(body?.guardians);
  if (guardians.error) return guardians;

  const facultyId = textField(body, 'facultyId');
  const courseId = textField(body, 'courseId');
  const academicYearId = textField(body, 'academicYearId');

  return {
    value: {
      institutionId,
      siteId,
      firstName: textField(body, 'firstName'),
      lastName: textField(body, 'lastName'),
      phone: textField(body, 'phone'),
      passportNumber: textField(body, 'passportNumber'),
      idNumber: textField(body, 'idNumber'),
      nationality: textField(body, 'nationality'),
      address: textField(body, 'address'),
      city: textField(body, 'city'),
      state: textField(body, 'state'),
      zip: textField(body, 'zip'),
      country: textField(body, 'country'),
      gender,
      dateOfBirth,
      foreignNational,
      verificationStatus,
      guardians: guardians.value,
      facultyId,
      courseId,
      academicYearId,
    },
  };
}

async function findOpenInstitution(institutionId) {
  try {
    const institution = await prisma.institutions.findFirst({
      where: { id: institutionId, is_deleted: false },
      select: { id: true },
    });
    if (!institution) {
      return { error: 'Institution not found', status: 400 };
    }
    return { id: institution.id };
  } catch (err) {
    if (err.code === 'P2023') {
      return { error: 'Institution not found', status: 400 };
    }
    return { error: err.message || 'Database error', status: 500 };
  }
}

async function findOpenStudent(id) {
  try {
    const student = await prisma.students.findFirst({
      where: { id, is_deleted: false },
      select: { id: true, site: { select: { institution_id: true } } },
    });
    if (!student) {
      return { error: 'Student not found', status: 404 };
    }
    return { student };
  } catch (err) {
    if (err.code === 'P2023') {
      return { error: 'Student not found', status: 404 };
    }
    return { error: err.message || 'Database error', status: 500 };
  }
}

async function findOpenCampus(siteId) {
  try {
    const site = await prisma.sites.findFirst({
      where: { id: siteId, is_deleted: false },
      select: { id: true, institution_id: true },
    });
    if (!site) {
      return { error: 'Campus not found', status: 400 };
    }
    return { site };
  } catch (err) {
    if (err.code === 'P2023') {
      return { error: 'Campus not found', status: 400 };
    }
    return { error: err.message || 'Database error', status: 500 };
  }
}

async function saveGuardians(tx, studentId, guardians) {
  if (guardians.length === 0) return;
  await tx.guardians.createMany({
    data: guardians.map((guardian) => ({
      student_id: studentId,
      name: guardian.name,
      relationship: guardian.relationship,
      phone: guardian.phone,
      email: guardian.email,
    })),
  });
}

export class StudentService {
  static async enrollmentOverview({ institutionId }) {
    const id = requiredText(institutionId);
    if (!id) {
      return { error: 'Institution ID is required', status: 400 };
    }

    const institution = await findOpenInstitution(id);
    if (institution.error) return institution;

    try {
      const students = await prisma.students.findMany({
        where: {
          is_deleted: false,
          site: { institution_id: institution.id, is_deleted: false },
        },
        select: {
          created_at: true,
          site_id: true,
          site: { select: { id: true, name: true } },
        },
      });

      const byYearMap = new Map();
      const byCampusMap = new Map();

      for (const student of students) {
        const year = String(student.created_at.getUTCFullYear());
        byYearMap.set(year, (byYearMap.get(year) || 0) + 1);

        const campusKey = student.site_id;
        const existing = byCampusMap.get(campusKey);
        if (existing) {
          existing.count += 1;
        } else {
          byCampusMap.set(campusKey, {
            siteId: campusKey,
            siteName: student.site?.name || 'Unknown campus',
            count: 1,
          });
        }
      }

      const byYear = [...byYearMap.entries()]
        .map(([year, count]) => ({ year, count }))
        .sort((a, b) => a.year.localeCompare(b.year));

      const byCampus = [...byCampusMap.values()].sort((a, b) =>
        a.siteName.localeCompare(b.siteName)
      );

      return {
        data: {
          totalStudents: students.length,
          byYear,
          byCampus,
        },
      };
    } catch (err) {
      return { error: err.message || 'Database error', status: 500 };
    }
  }

  static async list({ institutionId, siteId, page = 1, pageSize = 10 }) {
    const pageNum = parseInt(page, 10);
    const sizeNum = parseInt(pageSize, 10);
    const id = requiredText(institutionId);
    const campusFilter = requiredText(siteId);

    if (!id) {
      return { error: 'Institution is required', status: 400 };
    }
    if (isNaN(pageNum) || pageNum < 1) {
      return { error: 'Page must be an integer greater than or equal to 1', status: 400 };
    }
    if (isNaN(sizeNum) || sizeNum < 1 || sizeNum > 50) {
      return { error: 'Page size must be between 1 and 50', status: 400 };
    }

    const institution = await findOpenInstitution(id);
    if (institution.error) return institution;

    let campusId;
    if (campusFilter) {
      const campus = await findOpenCampus(campusFilter);
      if (campus.error) return campus;
      if (campus.site.institution_id !== institution.id) {
        return { error: 'Campus not found', status: 400 };
      }
      campusId = campus.site.id;
    }

    try {
      const where = {
        is_deleted: false,
        site: { institution_id: institution.id },
      };
      if (campusId) where.site_id = campusId;
      const [students, totalCount] = await Promise.all([
        prisma.students.findMany({
          where,
          orderBy: { created_at: 'desc' },
          skip: (pageNum - 1) * sizeNum,
          take: sizeNum,
          select: {
            id: true,
            first_name: true,
            last_name: true,
            phone: true,
            nationality: true,
            id_number: true,
            site_id: true,
            verification_status: true,
            created_at: true,
            site: { select: { name: true } },
            _count: { select: { guardians: true } },
          },
        }),
        prisma.students.count({ where }),
      ]);

      const pageCount = totalCount === 0 ? 0 : Math.ceil(totalCount / sizeNum);

      return {
        success: true,
        data: students.map(toListItem),
        pagination: {
          page: pageNum,
          pageSize: sizeNum,
          totalCount,
          pageCount,
        },
        summary: { totalCount },
      };
    } catch (err) {
      return { error: err.message || 'Database error', status: 500 };
    }
  }

  static async getById(id) {
    const found = await findOpenStudent(id);
    if (found.error) return found;

    try {
      const student = await prisma.students.findFirst({
        where: { id: found.student.id, is_deleted: false },
        select: detailSelect,
      });
      if (!student) {
        return { error: 'Student not found', status: 404 };
      }
      return { data: toDetail(student) };
    } catch (err) {
      return { error: err.message || 'Database error', status: 500 };
    }
  }

  static async create(body) {
    const parsed = parseBody(body);
    if (parsed.error) return parsed;
    const v = parsed.value;

    const firstName = requiredText(v.firstName);
    const lastName = requiredText(v.lastName);
    if (!firstName || !lastName) {
      return { error: 'First name and last name are required', status: 400 };
    }
    const courseId = requiredText(v.courseId);
    const academicYearId = requiredText(v.academicYearId);
    const facultyId = requiredText(v.facultyId);
    if (!facultyId || !courseId || !academicYearId) {
      return {
        error: 'Department, course, and academic year are required',
        status: 400,
      };
    }

    const institution = await findOpenInstitution(v.institutionId);
    if (institution.error) return institution;

    const campus = await findOpenCampus(v.siteId);
    if (campus.error) return campus;
    if (campus.site.institution_id !== institution.id) {
      return { error: 'Campus not found', status: 400 };
    }

    const course = await prisma.courses.findFirst({
      where: {
        id: courseId,
        institution_id: institution.id,
        faculty_id: facultyId,
        is_deleted: false,
      },
      select: { id: true, site_id: true },
    });
    if (!course) {
      return { error: 'Course not found for this department', status: 400 };
    }
    if (course.site_id && course.site_id !== campus.site.id) {
      return { error: 'Course is not offered on this campus', status: 400 };
    }

    const year = await prisma.academic_years.findFirst({
      where: {
        id: academicYearId,
        institution_id: institution.id,
        is_deleted: false,
      },
      select: { id: true },
    });
    if (!year) {
      return { error: 'Academic year not found', status: 400 };
    }

    try {
      const created = await prisma.$transaction(async (tx) => {
        const student = await tx.students.create({
          data: {
            site_id: campus.site.id,
            first_name: firstName,
            last_name: lastName,
            phone: v.phone ?? null,
            passport_number: v.passportNumber ?? null,
            id_number: v.idNumber ?? null,
            nationality: v.nationality ?? null,
            address: v.address ?? null,
            city: v.city ?? null,
            state: v.state ?? null,
            zip: v.zip ?? null,
            country: v.country ?? null,
            gender: v.gender ?? null,
            date_of_birth: v.dateOfBirth ?? null,
            foreign_national: v.foreignNational ?? false,
            verification_status: v.verificationStatus ?? 'PENDING',
          },
          select: { id: true },
        });
        await saveGuardians(tx, student.id, v.guardians ?? []);
        await tx.student_enrollments.create({
          data: {
            student_id: student.id,
            course_id: course.id,
            academic_year_id: year.id,
            institution_id: institution.id,
          },
        });
        return tx.students.findFirst({
          where: { id: student.id },
          select: detailSelect,
        });
      });
      return { data: toDetail(created) };
    } catch (err) {
      return { error: err.message || 'Database error', status: 500 };
    }
  }

  static async update(id, body) {
    const parsed = parseBody(body);
    if (parsed.error) return parsed;
    const v = parsed.value;

    const found = await findOpenStudent(id);
    if (found.error) return found;

    const currentInstitutionId = found.student.site.institution_id;
    if (v.institutionId !== currentInstitutionId) {
      return { error: 'Student cannot be moved to another institution', status: 400 };
    }

    const institution = await findOpenInstitution(v.institutionId);
    if (institution.error) return institution;

    const campus = await findOpenCampus(v.siteId);
    if (campus.error) return campus;
    if (campus.site.institution_id !== currentInstitutionId) {
      return { error: 'Student cannot be moved to another institution', status: 400 };
    }

    try {
      const updated = await prisma.$transaction(async (tx) => {
        await tx.students.update({
          where: { id: found.student.id },
          data: {
            site_id: campus.site.id,
            first_name: v.firstName,
            last_name: v.lastName,
            phone: v.phone,
            passport_number: v.passportNumber,
            id_number: v.idNumber,
            nationality: v.nationality,
            address: v.address,
            city: v.city,
            state: v.state,
            zip: v.zip,
            country: v.country,
            gender: v.gender,
            date_of_birth: v.dateOfBirth,
            foreign_national: v.foreignNational,
            verification_status: v.verificationStatus,
          },
        });
        if (v.guardians !== undefined) {
          await tx.guardians.deleteMany({ where: { student_id: found.student.id } });
          await saveGuardians(tx, found.student.id, v.guardians);
        }
        return tx.students.findFirst({
          where: { id: found.student.id },
          select: detailSelect,
        });
      });
      return { data: toDetail(updated) };
    } catch (err) {
      return { error: err.message || 'Database error', status: 500 };
    }
  }

  static async remove(id) {
    const found = await findOpenStudent(id);
    if (found.error) return found;

    try {
      await prisma.students.update({
        where: { id: found.student.id },
        data: { is_deleted: true },
      });
      return { success: true };
    } catch (err) {
      return { error: err.message || 'Database error', status: 500 };
    }
  }
}
