import prisma from '../config/prisma.js';

const INSTITUTION_TYPES = [
  'UNIVERSITY',
  'COLLEGE',
  'HIGH_SCHOOL',
  'PRIMARY_SCHOOL',
  'KINDERGARTEN',
  'OTHER',
];

function requiredText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function optionalText(value) {
  const text = requiredText(value);
  return text || null;
}

export class InstitutionService {
  static async list({ page = 1, pageSize = 10 }) {
    const pageNum = parseInt(page, 10);
    const sizeNum = parseInt(pageSize, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      return { error: 'Page must be an integer greater than or equal to 1', status: 400 };
    }

    if (isNaN(sizeNum) || sizeNum < 1 || sizeNum > 50) {
      return { error: 'Page size must be between 1 and 50', status: 400 };
    }

    try {
      const where = { is_deleted: false };

      const [institutions, totalCount] = await Promise.all([
        prisma.institutions.findMany({
          where,
          orderBy: { created_at: 'desc' },
          skip: (pageNum - 1) * sizeNum,
          take: sizeNum,
          select: {
            id: true,
            name: true,
            email: true,
            website: true,
            phone: true,
            city: true,
            country: true,
            institution_type: true,
            created_at: true,
          },
        }),
        prisma.institutions.count({ where }),
      ]);

      const data = institutions.map((inst) => ({
        id: inst.id,
        name: inst.name,
        email: inst.email,
        website: inst.website,
        phone: inst.phone,
        city: inst.city,
        country: inst.country,
        institutionType: inst.institution_type,
        createdAt: inst.created_at,
      }));

      const pageCount = totalCount === 0 ? 0 : Math.ceil(totalCount / sizeNum);

      return {
        success: true,
        data,
        pagination: {
          page: pageNum,
          pageSize: sizeNum,
          totalCount,
          pageCount,
        },
        summary: {
          totalCount,
        },
      };
    } catch (err) {
      return { error: err.message || 'Database error', status: 500 };
    }
  }

  static async create(body) {
    const name = requiredText(body?.name);
    const email = requiredText(body?.email);
    const institutionType = body?.institutionType;

    if (!name) {
      return { error: 'Name is required', status: 400 };
    }
    if (!email) {
      return { error: 'Email is required', status: 400 };
    }
    if (!INSTITUTION_TYPES.includes(institutionType)) {
      return { error: 'Institution type is not valid', status: 400 };
    }

    try {
      const created = await prisma.institutions.create({
        data: {
          name,
          email,
          institution_type: institutionType,
          phone: optionalText(body?.phone),
          city: optionalText(body?.city),
          country: optionalText(body?.country),
          website: optionalText(body?.website),
        },
        select: {
          id: true,
          name: true,
          email: true,
          website: true,
          phone: true,
          city: true,
          country: true,
          institution_type: true,
        },
      });

      return {
        data: {
          id: created.id,
          name: created.name,
          email: created.email,
          website: created.website,
          phone: created.phone,
          city: created.city,
          country: created.country,
          institutionType: created.institution_type,
        },
      };
    } catch (err) {
      if (err.code === 'P2002') {
        return { error: 'An institution with this email already exists', status: 400 };
      }
      return { error: err.message || 'Database error', status: 500 };
    }
  }
}