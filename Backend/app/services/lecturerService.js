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

// undefined means "not sent"; empty strings and null are stored as null.
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
  institution_id: true,
  site_id: true,
  verification_status: true,
  created_at: true,
  // user_id and department_id are intentionally not selected
  site: { select: { name: true } },
};

function toListItem(lecturer) {
  return {
    id: lecturer.id,
    firstName: lecturer.first_name,
    lastName: lecturer.last_name,
    phone: lecturer.phone,
    nationality: lecturer.nationality,
    idNumber: lecturer.id_number,
    institutionId: lecturer.institution_id,
    siteId: lecturer.site_id,
    siteName: lecturer.site_id ? lecturer.site?.name ?? null : null,
    verificationStatus: lecturer.verification_status,
    createdAt: lecturer.created_at,
  };
}

function toDetail(lecturer) {
  return {
    id: lecturer.id,
    firstName: lecturer.first_name,
    lastName: lecturer.last_name,
    phone: lecturer.phone,
    foreignNational: lecturer.foreign_national,
    passportNumber: lecturer.passport_number,
    idNumber: lecturer.id_number,
    dateOfBirth: toDateOnly(lecturer.date_of_birth),
    gender: lecturer.gender,
    nationality: lecturer.nationality,
    address: lecturer.address,
    city: lecturer.city,
    state: lecturer.state,
    zip: lecturer.zip,
    country: lecturer.country,
    institutionId: lecturer.institution_id,
    siteId: lecturer.site_id,
    siteName: lecturer.site_id ? lecturer.site?.name ?? null : null,
    verificationStatus: lecturer.verification_status,
    createdAt: lecturer.created_at,
  };
}

function parseBody(body) {
  const institutionId = requiredText(body?.institutionId);
  if (!institutionId) {
    return { error: 'Institution is required', status: 400 };
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

  let siteId;
  if (body?.siteId !== undefined) {
    siteId = body.siteId === null ? null : optionalText(body.siteId);
  }

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

async function findOpenLecturer(id) {
  try {
    const lecturer = await prisma.lecturers.findFirst({
      where: { id, is_deleted: false },
      select: { id: true, institution_id: true },
    });
    if (!lecturer) {
      return { error: 'Lecturer not found', status: 404 };
    }
    return { lecturer };
  } catch (err) {
    if (err.code === 'P2023') {
      return { error: 'Lecturer not found', status: 404 };
    }
    return { error: err.message || 'Database error', status: 500 };
  }
}

// The campus must be open and belong to the same institution.
async function checkSite(siteId, institutionId) {
  try {
    const site = await prisma.sites.findFirst({
      where: { id: siteId, is_deleted: false, institution_id: institutionId },
      select: { id: true },
    });
    if (!site) {
      return { error: 'Campus not found', status: 400 };
    }
    return { id: site.id };
  } catch (err) {
    if (err.code === 'P2023') {
      return { error: 'Campus not found', status: 400 };
    }
    return { error: err.message || 'Database error', status: 500 };
  }
}

export class LecturerService {
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
      const site = await checkSite(campusFilter, institution.id);
      if (site.error) return site;
      campusId = site.id;
    }

    try {
      const where = { is_deleted: false, institution_id: institution.id };
      if (campusId) where.site_id = campusId;
      const [lecturers, totalCount] = await Promise.all([
        prisma.lecturers.findMany({
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
            institution_id: true,
            site_id: true,
            verification_status: true,
            created_at: true,
            site: { select: { name: true } },
          },
        }),
        prisma.lecturers.count({ where }),
      ]);

      const pageCount = totalCount === 0 ? 0 : Math.ceil(totalCount / sizeNum);

      return {
        success: true,
        data: lecturers.map(toListItem),
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
    const found = await findOpenLecturer(id);
    if (found.error) return found;

    try {
      const lecturer = await prisma.lecturers.findFirst({
        where: { id: found.lecturer.id, is_deleted: false },
        select: detailSelect,
      });
      if (!lecturer) {
        return { error: 'Lecturer not found', status: 404 };
      }
      return { data: toDetail(lecturer) };
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

    const institution = await findOpenInstitution(v.institutionId);
    if (institution.error) return institution;

    let siteId = null;
    if (v.siteId) {
      const site = await checkSite(v.siteId, institution.id);
      if (site.error) return site;
      siteId = site.id;
    }

    try {
      const created = await prisma.lecturers.create({
        data: {
          institution_id: institution.id,
          site_id: siteId,
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
          // user_id and department_id stay null
        },
        select: detailSelect,
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

    const found = await findOpenLecturer(id);
    if (found.error) return found;
    if (v.institutionId !== found.lecturer.institution_id) {
      return { error: 'Lecturer cannot be moved to another institution', status: 400 };
    }

    const institution = await findOpenInstitution(v.institutionId);
    if (institution.error) return institution;

    let siteId; // undefined keeps the saved campus
    if (v.siteId === null) {
      siteId = null;
    } else if (v.siteId) {
      const site = await checkSite(v.siteId, institution.id);
      if (site.error) return site;
      siteId = site.id;
    }

    try {
      // Fields that were not sent stay undefined, so Prisma leaves them alone.
      // user_id and department_id are never part of the update.
      const updated = await prisma.lecturers.update({
        where: { id: found.lecturer.id },
        data: {
          site_id: siteId,
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
        select: detailSelect,
      });
      return { data: toDetail(updated) };
    } catch (err) {
      return { error: err.message || 'Database error', status: 500 };
    }
  }

  static async remove(id) {
    const found = await findOpenLecturer(id);
    if (found.error) return found;

    try {
      await prisma.lecturers.update({
        where: { id: found.lecturer.id },
        data: { is_deleted: true },
      });
      return { success: true };
    } catch (err) {
      return { error: err.message || 'Database error', status: 500 };
    }
  }
}
