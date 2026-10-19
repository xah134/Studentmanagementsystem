import prisma from '../config/prisma.js';

function requiredText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function optionalText(value) {
  const text = requiredText(value);
  return text || null;
}

function parseOptionalNumber(value, label) {
  if (value === undefined || value === null || value === '') {
    return { value: null };
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      return { error: `${label} must be a number`, status: 400 };
    }
    return { value };
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return { value: null };
    const number = Number(trimmed);
    if (!Number.isFinite(number)) {
      return { error: `${label} must be a number`, status: 400 };
    }
    return { value: number };
  }
  return { error: `${label} must be a number`, status: 400 };
}

function toListItem(site) {
  return {
    id: site.id,
    name: site.name,
    city: site.city,
    state: site.state,
    address: site.address,
    description: site.description,
    latitude: site.latitude,
    longitude: site.longitude,
    createdAt: site.created_at,
  };
}

function toDetail(site) {
  return {
    id: site.id,
    name: site.name,
    address: site.address,
    city: site.city,
    state: site.state,
    zip: site.zip,
    latitude: site.latitude,
    longitude: site.longitude,
    description: site.description,
    institutionId: site.institution_id,
    createdAt: site.created_at,
  };
}

const detailSelect = {
  id: true,
  name: true,
  address: true,
  city: true,
  state: true,
  zip: true,
  latitude: true,
  longitude: true,
  description: true,
  institution_id: true,
  created_at: true,
};

function parseBody(body) {
  const institutionId = requiredText(body?.institutionId);
  const name = requiredText(body?.name);

  if (!institutionId) {
    return { error: 'Institution is required', status: 400 };
  }
  if (!name) {
    return { error: 'Name is required', status: 400 };
  }

  const latitude = parseOptionalNumber(body?.latitude, 'Latitude');
  if (latitude.error) return latitude;
  const longitude = parseOptionalNumber(body?.longitude, 'Longitude');
  if (longitude.error) return longitude;

  return {
    value: {
      institutionId,
      name,
      address: optionalText(body?.address),
      city: optionalText(body?.city),
      state: optionalText(body?.state),
      zip: optionalText(body?.zip),
      description: optionalText(body?.description),
      latitude: latitude.value,
      longitude: longitude.value,
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

async function findOpenCampus(id) {
  try {
    const site = await prisma.sites.findFirst({
      where: { id, is_deleted: false },
      select: { id: true, institution_id: true },
    });
    if (!site) {
      return { error: 'Campus not found', status: 404 };
    }
    return { site };
  } catch (err) {
    if (err.code === 'P2023') {
      return { error: 'Campus not found', status: 404 };
    }
    return { error: err.message || 'Database error', status: 500 };
  }
}

function duplicateName(err) {
  return err?.code === 'P2002';
}

export class SiteService {
  static async list({ institutionId, page = 1, pageSize = 10 }) {
    const pageNum = parseInt(page, 10);
    const sizeNum = parseInt(pageSize, 10);
    const id = requiredText(institutionId);

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

    try {
      const where = { is_deleted: false, institution_id: institution.id };
      const [sites, totalCount] = await Promise.all([
        prisma.sites.findMany({
          where,
          orderBy: { created_at: 'desc' },
          skip: (pageNum - 1) * sizeNum,
          take: sizeNum,
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
            address: true,
            description: true,
            latitude: true,
            longitude: true,
            created_at: true,
          },
        }),
        prisma.sites.count({ where }),
      ]);

      const pageCount = totalCount === 0 ? 0 : Math.ceil(totalCount / sizeNum);

      return {
        success: true,
        data: sites.map(toListItem),
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
    const found = await findOpenCampus(id);
    if (found.error) return found;

    try {
      const site = await prisma.sites.findFirst({
        where: { id: found.site.id, is_deleted: false },
        select: detailSelect,
      });
      if (!site) {
        return { error: 'Campus not found', status: 404 };
      }
      return { data: toDetail(site) };
    } catch (err) {
      return { error: err.message || 'Database error', status: 500 };
    }
  }

  static async create(body) {
    const parsed = parseBody(body);
    if (parsed.error) return parsed;

    const institution = await findOpenInstitution(parsed.value.institutionId);
    if (institution.error) return institution;

    try {
      const created = await prisma.sites.create({
        data: {
          institution_id: institution.id,
          name: parsed.value.name,
          address: parsed.value.address,
          city: parsed.value.city,
          state: parsed.value.state,
          zip: parsed.value.zip,
          description: parsed.value.description,
          latitude: parsed.value.latitude,
          longitude: parsed.value.longitude,
        },
        select: detailSelect,
      });
      return { data: toDetail(created) };
    } catch (err) {
      if (duplicateName(err)) {
        return { error: 'A campus with this name already exists', status: 400 };
      }
      return { error: err.message || 'Database error', status: 500 };
    }
  }

  static async update(id, body) {
    const parsed = parseBody(body);
    if (parsed.error) return parsed;

    const found = await findOpenCampus(id);
    if (found.error) return found;
    if (parsed.value.institutionId !== found.site.institution_id) {
      return { error: 'Campus cannot be moved to another institution', status: 400 };
    }

    const institution = await findOpenInstitution(parsed.value.institutionId);
    if (institution.error) return institution;

    try {
      const updated = await prisma.sites.update({
        where: { id: found.site.id },
        data: {
          name: parsed.value.name,
          address: parsed.value.address,
          city: parsed.value.city,
          state: parsed.value.state,
          zip: parsed.value.zip,
          description: parsed.value.description,
          latitude: parsed.value.latitude,
          longitude: parsed.value.longitude,
        },
        select: detailSelect,
      });
      return { data: toDetail(updated) };
    } catch (err) {
      if (duplicateName(err)) {
        return { error: 'A campus with this name already exists', status: 400 };
      }
      return { error: err.message || 'Database error', status: 500 };
    }
  }

  static async remove(id) {
    const found = await findOpenCampus(id);
    if (found.error) return found;

    try {
      await prisma.sites.update({
        where: { id: found.site.id },
        data: { is_deleted: true },
      });
      return { success: true };
    } catch (err) {
      return { error: err.message || 'Database error', status: 500 };
    }
  }
}
