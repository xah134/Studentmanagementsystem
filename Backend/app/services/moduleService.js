import prisma from '../config/prisma.js';

function requiredText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function optionalText(value) {
  const text = requiredText(value);
  return text || null;
}

function toListItem(moduleRow) {
  return {
    id: moduleRow.id,
    name: moduleRow.name,
    code: moduleRow.code,
    description: moduleRow.description,
    credits: moduleRow.credits,
    courseId: moduleRow.course_id,
    courseName: moduleRow.course?.name ?? null,
    createdAt: moduleRow.created_at,
  };
}

function toDetail(moduleRow) {
  return {
    id: moduleRow.id,
    name: moduleRow.name,
    code: moduleRow.code,
    description: moduleRow.description,
    credits: moduleRow.credits,
    courseId: moduleRow.course_id,
    institutionId: moduleRow.institution_id,
    createdAt: moduleRow.created_at,
  };
}

const listSelect = {
  id: true,
  name: true,
  code: true,
  description: true,
  credits: true,
  course_id: true,
  created_at: true,
  course: {
    select: { name: true },
  },
};

const detailSelect = {
  id: true,
  name: true,
  code: true,
  description: true,
  credits: true,
  course_id: true,
  institution_id: true,
  created_at: true,
};

function duplicateName(err) {
  return err?.code === 'P2002';
}

function parseCredits(value) {
  if (value === undefined || value === null) return { value: null };
  if (typeof value === 'string') {
    const text = value.trim();
    if (!text) return { value: null };
    const num = Number(text);
    if (!Number.isInteger(num) || num < 0) {
      return { error: 'Credits must be a whole number', status: 400 };
    }
    return { value: num };
  }
  if (typeof value === 'number') {
    if (!Number.isInteger(value) || value < 0) {
      return { error: 'Credits must be a whole number', status: 400 };
    }
    return { value };
  }
  return { error: 'Credits must be a whole number', status: 400 };
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

async function findOpenModule(id) {
  try {
    const moduleRow = await prisma.modules.findFirst({
      where: { id, is_deleted: false },
      select: { id: true, institution_id: true },
    });
    if (!moduleRow) {
      return { error: 'Module not found', status: 404 };
    }
    return { module: moduleRow };
  } catch (err) {
    if (err.code === 'P2023') {
      return { error: 'Module not found', status: 404 };
    }
    return { error: err.message || 'Database error', status: 500 };
  }
}

async function resolveCourse(courseId, institutionId) {
  const id = requiredText(courseId);
  if (!id) return { error: 'Course not found', status: 400 };

  try {
    const course = await prisma.courses.findFirst({
      where: {
        id,
        is_deleted: false,
        institution_id: institutionId,
      },
      select: { id: true },
    });
    if (!course) {
      return { error: 'Course not found', status: 400 };
    }
    return { value: course.id };
  } catch (err) {
    if (err.code === 'P2023') {
      return { error: 'Course not found', status: 400 };
    }
    return { error: err.message || 'Database error', status: 500 };
  }
}

function parseBody(body) {
  const institutionId = requiredText(body?.institutionId);
  const courseId = requiredText(body?.courseId);
  const name = requiredText(body?.name);

  if (!institutionId) {
    return { error: 'Institution is required', status: 400 };
  }
  if (!courseId) {
    return { error: 'Course is required', status: 400 };
  }
  if (!name) {
    return { error: 'Name is required', status: 400 };
  }

  const credits = parseCredits(body?.credits);
  if (credits.error) return credits;

  return {
    value: {
      institutionId,
      courseId,
      name,
      code: optionalText(body?.code),
      description: optionalText(body?.description),
      credits: credits.value,
    },
  };
}

export class ModuleService {
  static async list({ institutionId, courseId, page = 1, pageSize = 10 }) {
    const pageNum = parseInt(page, 10);
    const sizeNum = parseInt(pageSize, 10);
    const id = requiredText(institutionId);
    const courseFilter = requiredText(courseId);

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

    let courseFilterId = null;
    if (courseFilter) {
      const course = await resolveCourse(courseFilter, institution.id);
      if (course.error) return course;
      courseFilterId = course.value;
    }

    try {
      const where = { is_deleted: false, institution_id: institution.id };
      if (courseFilterId) where.course_id = courseFilterId;

      const [modules, totalCount] = await Promise.all([
        prisma.modules.findMany({
          where,
          orderBy: { created_at: 'desc' },
          skip: (pageNum - 1) * sizeNum,
          take: sizeNum,
          select: listSelect,
        }),
        prisma.modules.count({ where }),
      ]);

      const pageCount = totalCount === 0 ? 0 : Math.ceil(totalCount / sizeNum);

      return {
        success: true,
        data: modules.map(toListItem),
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
    const found = await findOpenModule(id);
    if (found.error) return found;

    try {
      const moduleRow = await prisma.modules.findFirst({
        where: { id: found.module.id, is_deleted: false },
        select: detailSelect,
      });
      if (!moduleRow) {
        return { error: 'Module not found', status: 404 };
      }
      return { data: toDetail(moduleRow) };
    } catch (err) {
      return { error: err.message || 'Database error', status: 500 };
    }
  }

  static async create(body) {
    const parsed = parseBody(body);
    if (parsed.error) return parsed;

    const institution = await findOpenInstitution(parsed.value.institutionId);
    if (institution.error) return institution;

    const course = await resolveCourse(parsed.value.courseId, institution.id);
    if (course.error) return course;

    try {
      const created = await prisma.modules.create({
        data: {
          institution_id: institution.id,
          course_id: course.value,
          name: parsed.value.name,
          code: parsed.value.code,
          description: parsed.value.description,
          credits: parsed.value.credits,
        },
        select: detailSelect,
      });
      return { data: toDetail(created) };
    } catch (err) {
      if (duplicateName(err)) {
        return { error: 'A module with this name already exists', status: 400 };
      }
      return { error: err.message || 'Database error', status: 500 };
    }
  }

  static async update(id, body) {
    const parsed = parseBody(body);
    if (parsed.error) return parsed;

    const found = await findOpenModule(id);
    if (found.error) return found;
    if (parsed.value.institutionId !== found.module.institution_id) {
      return { error: 'Module cannot be moved to another institution', status: 400 };
    }

    const institution = await findOpenInstitution(parsed.value.institutionId);
    if (institution.error) return institution;

    const course = await resolveCourse(parsed.value.courseId, institution.id);
    if (course.error) return course;

    try {
      const updated = await prisma.modules.update({
        where: { id: found.module.id },
        data: {
          course_id: course.value,
          name: parsed.value.name,
          code: parsed.value.code,
          description: parsed.value.description,
          credits: parsed.value.credits,
        },
        select: detailSelect,
      });
      return { data: toDetail(updated) };
    } catch (err) {
      if (err.code === 'P2023') {
        return { error: 'Module not found', status: 404 };
      }
      if (duplicateName(err)) {
        return { error: 'A module with this name already exists', status: 400 };
      }
      return { error: err.message || 'Database error', status: 500 };
    }
  }

  static async remove(id) {
    const found = await findOpenModule(id);
    if (found.error) return found;

    try {
      await prisma.modules.update({
        where: { id: found.module.id },
        data: { is_deleted: true },
      });
      return { success: true };
    } catch (err) {
      return { error: err.message || 'Database error', status: 500 };
    }
  }
}
