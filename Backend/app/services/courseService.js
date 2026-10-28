import prisma from '../config/prisma.js';

function requiredText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function optionalText(value) {
  const text = requiredText(value);
  return text || null;
}

function toListItem(course) {
  return {
    id: course.id,
    name: course.name,
    code: course.code,
    description: course.description,
    facultyId: course.faculty_id,
    facultyName: course.faculty?.name ?? null,
    campusId: course.site_id,
    campusName: course.site?.name ?? null,
    createdAt: course.created_at,
  };
}

function toDetail(course) {
  return {
    id: course.id,
    name: course.name,
    code: course.code,
    description: course.description,
    facultyId: course.faculty_id,
    campusId: course.site_id,
    institutionId: course.institution_id,
    createdAt: course.created_at,
  };
}

const listSelect = {
  id: true,
  name: true,
  code: true,
  description: true,
  faculty_id: true,
  site_id: true,
  created_at: true,
  faculty: {
    select: { name: true },
  },
  site: {
    select: { name: true },
  },
};

const detailSelect = {
  id: true,
  name: true,
  code: true,
  description: true,
  faculty_id: true,
  site_id: true,
  institution_id: true,
  created_at: true,
};

function duplicateName(err) {
  return err?.code === 'P2002';
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

async function findOpenCourse(id) {
  try {
    const course = await prisma.courses.findFirst({
      where: { id, is_deleted: false },
      select: { id: true, institution_id: true },
    });
    if (!course) {
      return { error: 'Course not found', status: 404 };
    }
    return { course };
  } catch (err) {
    if (err.code === 'P2023') {
      return { error: 'Course not found', status: 404 };
    }
    return { error: err.message || 'Database error', status: 500 };
  }
}

async function resolveFaculty(facultyId, institutionId) {
  const id = requiredText(facultyId);
  if (!id) return { error: 'Faculty not found', status: 400 };

  try {
    const faculty = await prisma.faculties.findFirst({
      where: {
        id,
        is_deleted: false,
        institution_id: institutionId,
      },
      select: { id: true },
    });
    if (!faculty) {
      return { error: 'Faculty not found', status: 400 };
    }
    return { value: faculty.id };
  } catch (err) {
    if (err.code === 'P2023') {
      return { error: 'Faculty not found', status: 400 };
    }
    return { error: err.message || 'Database error', status: 500 };
  }
}

async function resolveCampus(campusId, institutionId) {
  const id = requiredText(campusId);
  if (!id) return { value: null };

  try {
    const campus = await prisma.sites.findFirst({
      where: {
        id,
        is_deleted: false,
        institution_id: institutionId,
      },
      select: { id: true },
    });
    if (!campus) {
      return { error: 'Campus not found', status: 400 };
    }
    return { value: campus.id };
  } catch (err) {
    if (err.code === 'P2023') {
      return { error: 'Campus not found', status: 400 };
    }
    return { error: err.message || 'Database error', status: 500 };
  }
}

function parseBody(body) {
  const institutionId = requiredText(body?.institutionId);
  const facultyId = requiredText(body?.facultyId);
  const name = requiredText(body?.name);

  if (!institutionId) {
    return { error: 'Institution is required', status: 400 };
  }
  if (!facultyId) {
    return { error: 'Faculty is required', status: 400 };
  }
  if (!name) {
    return { error: 'Name is required', status: 400 };
  }

  return {
    value: {
      institutionId,
      facultyId,
      name,
      code: optionalText(body?.code),
      description: optionalText(body?.description),
      campusId: body?.campusId,
    },
  };
}

export class CourseService {
  static async list({ institutionId, facultyId, siteId, page = 1, pageSize = 10 }) {
    const pageNum = parseInt(page, 10);
    const sizeNum = parseInt(pageSize, 10);
    const id = requiredText(institutionId);
    const facultyFilter = requiredText(facultyId);
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

    let facultyFilterId = null;
    if (facultyFilter) {
      const faculty = await resolveFaculty(facultyFilter, institution.id);
      if (faculty.error) return faculty;
      facultyFilterId = faculty.value;
    }

    let campusFilterId = null;
    if (campusFilter) {
      const campus = await resolveCampus(campusFilter, institution.id);
      if (campus.error) return campus;
      campusFilterId = campus.value;
    }

    try {
      const where = { is_deleted: false, institution_id: institution.id };
      if (facultyFilterId) where.faculty_id = facultyFilterId;
      if (campusFilterId) where.site_id = campusFilterId;

      const [courses, totalCount] = await Promise.all([
        prisma.courses.findMany({
          where,
          orderBy: { created_at: 'desc' },
          skip: (pageNum - 1) * sizeNum,
          take: sizeNum,
          select: listSelect,
        }),
        prisma.courses.count({ where }),
      ]);

      const pageCount = totalCount === 0 ? 0 : Math.ceil(totalCount / sizeNum);

      return {
        success: true,
        data: courses.map(toListItem),
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
    const found = await findOpenCourse(id);
    if (found.error) return found;

    try {
      const course = await prisma.courses.findFirst({
        where: { id: found.course.id, is_deleted: false },
        select: detailSelect,
      });
      if (!course) {
        return { error: 'Course not found', status: 404 };
      }
      return { data: toDetail(course) };
    } catch (err) {
      return { error: err.message || 'Database error', status: 500 };
    }
  }

  static async create(body) {
    const parsed = parseBody(body);
    if (parsed.error) return parsed;

    const institution = await findOpenInstitution(parsed.value.institutionId);
    if (institution.error) return institution;

    const faculty = await resolveFaculty(parsed.value.facultyId, institution.id);
    if (faculty.error) return faculty;

    const campus = await resolveCampus(parsed.value.campusId, institution.id);
    if (campus.error) return campus;

    try {
      const created = await prisma.courses.create({
        data: {
          institution_id: institution.id,
          faculty_id: faculty.value,
          name: parsed.value.name,
          code: parsed.value.code,
          description: parsed.value.description,
          site_id: campus.value,
        },
        select: detailSelect,
      });
      return { data: toDetail(created) };
    } catch (err) {
      if (duplicateName(err)) {
        return { error: 'A course with this name already exists', status: 400 };
      }
      return { error: err.message || 'Database error', status: 500 };
    }
  }

  static async update(id, body) {
    const parsed = parseBody(body);
    if (parsed.error) return parsed;

    const found = await findOpenCourse(id);
    if (found.error) return found;
    if (parsed.value.institutionId !== found.course.institution_id) {
      return { error: 'Course cannot be moved to another institution', status: 400 };
    }

    const institution = await findOpenInstitution(parsed.value.institutionId);
    if (institution.error) return institution;

    const faculty = await resolveFaculty(parsed.value.facultyId, institution.id);
    if (faculty.error) return faculty;

    const campus = await resolveCampus(parsed.value.campusId, institution.id);
    if (campus.error) return campus;

    try {
      const updated = await prisma.courses.update({
        where: { id: found.course.id },
        data: {
          faculty_id: faculty.value,
          name: parsed.value.name,
          code: parsed.value.code,
          description: parsed.value.description,
          site_id: campus.value,
        },
        select: detailSelect,
      });
      return { data: toDetail(updated) };
    } catch (err) {
      if (err.code === 'P2023') {
        return { error: 'Course not found', status: 404 };
      }
      if (duplicateName(err)) {
        return { error: 'A course with this name already exists', status: 400 };
      }
      return { error: err.message || 'Database error', status: 500 };
    }
  }

  static async remove(id) {
    const found = await findOpenCourse(id);
    if (found.error) return found;

    try {
      await prisma.courses.update({
        where: { id: found.course.id },
        data: { is_deleted: true },
      });
      return { success: true };
    } catch (err) {
      return { error: err.message || 'Database error', status: 500 };
    }
  }
}
