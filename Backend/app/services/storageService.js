import { createClient } from '@supabase/supabase-js';

const BUCKET = 'assets';
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

function adminClient() {
  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    return null;
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function extensionFor(mime) {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  if (mime === 'image/gif') return 'gif';
  if (mime === 'image/svg+xml') return 'svg';
  return 'jpg';
}

export class StorageService {
  static async uploadInstitutionLogo({ institutionId, buffer, mimeType }) {
    if (!buffer?.length) {
      return { error: 'Logo file is required', status: 400 };
    }
    if (buffer.length > MAX_BYTES) {
      return { error: 'Logo must be 5MB or smaller', status: 400 };
    }
    if (!ALLOWED_TYPES.has(mimeType)) {
      return {
        error: 'Logo must be a PNG, JPEG, WebP, GIF, or SVG image',
        status: 400,
      };
    }

    const client = adminClient();
    if (!client) {
      return { error: 'Storage is not configured', status: 500 };
    }

    const path = `institutions/${institutionId}/logo.${extensionFor(mimeType)}`;
    const { error } = await client.storage.from(BUCKET).upload(path, buffer, {
      contentType: mimeType,
      upsert: true,
    });
    if (error) {
      return { error: error.message || 'Could not upload logo', status: 502 };
    }

    const { data } = client.storage.from(BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) {
      return { error: 'Could not resolve logo URL', status: 502 };
    }

    // Bust caches after replace uploads.
    const publicUrl = `${data.publicUrl}?v=${Date.now()}`;
    return { data: { path, publicUrl } };
  }
}
