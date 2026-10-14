import prisma from '../config/prisma.js';

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
}