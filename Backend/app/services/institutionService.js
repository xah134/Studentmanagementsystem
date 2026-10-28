import prisma from '../config/prisma.js';
import { StorageService } from './storageService.js';

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

function toInstitution(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    website: row.website,
    phone: row.phone,
    city: row.city,
    country: row.country,
    institutionType: row.institution_type,
    logo: row.logo ?? null,
    createdAt: row.created_at,
  };
}

const institutionSelect = {
  id: true,
  name: true,
  email: true,
  website: true,
  phone: true,
  city: true,
  country: true,
  institution_type: true,
  logo: true,
  created_at: true,
};

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
          select: institutionSelect,
        }),
        prisma.institutions.count({ where }),
      ]);

      const data = institutions.map(toInstitution);

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
          logo: optionalText(body?.logo),
        },
        select: institutionSelect,
      });

      return { data: toInstitution(created) };
    } catch (err) {
      if (err.code === 'P2002') {
        return { error: 'An institution with this email already exists', status: 400 };
      }
      return { error: err.message || 'Database error', status: 500 };
    }
  }

  static async uploadLogo(id, file) {
    if (!file) {
      return { error: 'Logo file is required', status: 400 };
    }

    try {
      const existing = await prisma.institutions.findFirst({
        where: { id, is_deleted: false },
        select: { id: true },
      });
      if (!existing) {
        return { error: 'Institution not found', status: 404 };
      }

      const uploaded = await StorageService.uploadInstitutionLogo({
        institutionId: existing.id,
        buffer: file.buffer,
        mimeType: file.mimetype,
      });
      if (uploaded.error) return uploaded;

      const updated = await prisma.institutions.update({
        where: { id: existing.id },
        data: { logo: uploaded.data.publicUrl },
        select: institutionSelect,
      });
      return { data: toInstitution(updated) };
    } catch (err) {
      if (err.code === 'P2023') {
        return { error: 'Institution not found', status: 404 };
      }
      return { error: err.message || 'Database error', status: 500 };
    }
  }

  static async update(id, body) {
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
      const existing = await prisma.institutions.findFirst({
        where: { id, is_deleted: false },
        select: { id: true },
      });
      if (!existing) {
        return { error: 'Institution not found', status: 404 };
      }

      const updated = await prisma.institutions.update({
        where: { id },
        data: {
          name,
          email,
          institution_type: institutionType,
          phone: optionalText(body?.phone),
          city: optionalText(body?.city),
          country: optionalText(body?.country),
          website: optionalText(body?.website),
          ...(body?.logo !== undefined ? { logo: optionalText(body.logo) } : {}),
        },
        select: institutionSelect,
      });

      return { data: toInstitution(updated) };
    } catch (err) {
      if (err.code === 'P2023') {
        return { error: 'Institution not found', status: 404 };
      }
      if (err.code === 'P2002') {
        return { error: 'An institution with this email already exists', status: 400 };
      }
      return { error: err.message || 'Database error', status: 500 };
    }
  }
}
