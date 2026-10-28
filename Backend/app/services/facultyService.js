import prisma from '../config/prisma.js';

function requiredText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function optionalText(value) {
  const text = requiredText(value);
  return text || null;
}

function toListItem(faculty) {
  return {
    id: faculty.id,
    name: faculty.name,
    code: faculty.code,
    description: faculty.description,
    campusId: faculty.site_id,
    campusName: faculty.site?.name ?? null,
    createdAt: faculty.created_at,
  };
}

function toDetail(faculty) {
  return {
    id: faculty.id,
    name: faculty.name,
    code: faculty.code,
    description: faculty.description,
    campusId: faculty.site_id,
    institutionId: faculty.institution_id,
    createdAt: faculty.created_at,
  };
}

const listSelect = {
  id: true,
  name: true,
  code: true,
  description: true,
  site_id: true,
  created_at: true,
  site: {
    select: { name: true },
  },
};

const detailSelect = {
  id: true,
  name: true,
  code: true,
  description: true,
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

async function findOpenFaculty(id) {
  try {
    const faculty = await prisma.faculties.findFirst({
      where: { id, is_deleted: false },
      select: { id: true, institution_id: true },
    });
    if (!faculty) {
      return { error: 'Faculty not found', status: 404 };
    }
    return { faculty };
  } catch (err) {
    if (err.code === 'P2023') {
      return { error: 'Faculty not found', status: 404 };
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
  const name = requiredText(body?.name);

  if (!institutionId) {
    return { error: 'Institution is required', status: 400 };
  }
  if (!name) {
    return { error: 'Name is required', status: 400 };
  }

  return {
    value: {
      institutionId,
      name,
      code: optionalText(body?.code),
      description: optionalText(body?.description),
      campusId: body?.campusId,
    },
  };
}

export class FacultyService {
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

    let campusFilterId = null;
    if (campusFilter) {
      const campus = await resolveCampus(campusFilter, institution.id);
      if (campus.error) return campus;
      campusFilterId = campus.value;
    }

    try {
      const where = { is_deleted: false, institution_id: institution.id };
      if (campusFilterId) where.site_id = campusFilterId;
      const [faculties, totalCount] = await Promise.all([
        prisma.faculties.findMany({
          where,
          orderBy: { created_at: 'desc' },
          skip: (pageNum - 1) * sizeNum,
          take: sizeNum,
          select: listSelect,
        }),
        prisma.faculties.count({ where }),
      ]);

      const pageCount = totalCount === 0 ? 0 : Math.ceil(totalCount / sizeNum);

      return {
        success: true,
        data: faculties.map(toListItem),
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
    const found = await findOpenFaculty(id);
    if (found.error) return found;

    try {
      const faculty = await prisma.faculties.findFirst({
        where: { id: found.faculty.id, is_deleted: false },
        select: detailSelect,
      });
      if (!faculty) {
        return { error: 'Faculty not found', status: 404 };
      }
      return { data: toDetail(faculty) };
    } catch (err) {
      return { error: err.message || 'Database error', status: 500 };
    }
  }

  static async create(body) {
    const parsed = parseBody(body);
    if (parsed.error) return parsed;

    const institution = await findOpenInstitution(parsed.value.institutionId);
    if (institution.error) return institution;

    const campus = await resolveCampus(parsed.value.campusId, institution.id);
    if (campus.error) return campus;

    try {
      const created = await prisma.faculties.create({
        data: {
          institution_id: institution.id,
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
        return { error: 'A faculty with this name already exists', status: 400 };
      }
      return { error: err.message || 'Database error', status: 500 };
    }
  }

  static async update(id, body) {
    const parsed = parseBody(body);
    if (parsed.error) return parsed;

    const found = await findOpenFaculty(id);
    if (found.error) return found;
    if (parsed.value.institutionId !== found.faculty.institution_id) {
      return { error: 'Faculty cannot be moved to another institution', status: 400 };
    }

    const institution = await findOpenInstitution(parsed.value.institutionId);
    if (institution.error) return institution;

    const campus = await resolveCampus(parsed.value.campusId, institution.id);
    if (campus.error) return campus;

    try {
      const updated = await prisma.faculties.update({
        where: { id: found.faculty.id },
        data: {
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
        return { error: 'Faculty not found', status: 404 };
      }
      if (duplicateName(err)) {
        return { error: 'A faculty with this name already exists', status: 400 };
      }
      return { error: err.message || 'Database error', status: 500 };
    }
  }

  static async remove(id) {
    const found = await findOpenFaculty(id);
    if (found.error) return found;

    try {
      await prisma.faculties.update({
        where: { id: found.faculty.id },
        data: { is_deleted: true },
      });
      return { success: true };
    } catch (err) {
      return { error: err.message || 'Database error', status: 500 };
    }
  }
}
