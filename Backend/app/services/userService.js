import { createClient } from '@supabase/supabase-js';
import prisma from '../config/prisma.js';
import { Role } from '../types/user.js';

const ROLES = Object.values(Role);

function supabase() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

function requiredText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isDuplicateEmail(error) {
  const message = `${error?.message || ''} ${error?.code || ''}`.toLowerCase();
  return (
    message.includes('already') ||
    message.includes('duplicate') ||
    message.includes('registered')
  );
}

export class UserService {
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

      const [users, totalCount] = await Promise.all([
        prisma.users.findMany({
          where,
          orderBy: { created_at: 'desc' },
          skip: (pageNum - 1) * sizeNum,
          take: sizeNum,
          // auth_id is intentionally not selected
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            phone: true,
            role: true,
            created_at: true,
          },
        }),
        prisma.users.count({ where }),
      ]);

      const data = users.map((user) => ({
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.created_at,
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
    const firstName = requiredText(body?.firstName);
    const lastName = requiredText(body?.lastName);
    const email = requiredText(body?.email);
    const password = typeof body?.password === 'string' ? body.password : '';
    const role = body?.role;
    const phone = requiredText(body?.phone);

    if (!firstName) {
      return { error: 'First name is required', status: 400 };
    }
    if (!lastName) {
      return { error: 'Last name is required', status: 400 };
    }
    if (!email) {
      return { error: 'Email is required', status: 400 };
    }
    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters', status: 400 };
    }
    if (!ROLES.includes(role)) {
      return { error: 'Role is not valid', status: 400 };
    }

    let institutionId = null;
    if (role !== Role.SYSTEM_ADMIN) {
      institutionId = requiredText(body?.institutionId);
      if (!institutionId) {
        return { error: 'Institution is required', status: 400 };
      }
      const institution = await prisma.institutions.findFirst({
        where: { id: institutionId, is_deleted: false },
        select: { id: true },
      });
      if (!institution) {
        return { error: 'Institution not found', status: 400 };
      }
    }

    const { data, error } = await supabase().auth.signUp({ email, password });
    if (error) {
      if (isDuplicateEmail(error)) {
        return { error: 'A user with this email already exists', status: 400 };
      }
      return { error: error.message, status: 400 };
    }
    if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return { error: 'A user with this email already exists', status: 400 };
    }

    try {
      const created = await prisma.users.create({
        data: {
          first_name: firstName,
          last_name: lastName,
          email,
          phone: phone || null,
          role,
          institution_id: institutionId,
          auth_id: data?.user?.id || null,
        },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
          role: true,
        },
      });

      return {
        data: {
          id: created.id,
          firstName: created.first_name,
          lastName: created.last_name,
          email: created.email,
          phone: created.phone,
          role: created.role,
        },
      };
    } catch (err) {
      if (err.code === 'P2002') {
        return { error: 'A user with this email already exists', status: 400 };
      }
      return { error: err.message || 'Database error', status: 500 };
    }
  }
}
