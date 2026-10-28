-- Create the public "assets" storage bucket used for institution logos.
-- Safe to run when the Supabase storage schema is present; no-op otherwise.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.schemata
    WHERE schema_name = 'storage'
  ) THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'assets',
      'assets',
      true,
      5242880,
      ARRAY[
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/webp',
        'image/gif',
        'image/svg+xml'
      ]::text[]
    )
    ON CONFLICT (id) DO UPDATE
    SET
      public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'storage' AND table_name = 'objects'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'assets_public_read'
    ) THEN
      CREATE POLICY assets_public_read
        ON storage.objects
        FOR SELECT
        USING (bucket_id = 'assets');
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'assets_public_insert'
    ) THEN
      CREATE POLICY assets_public_insert
        ON storage.objects
        FOR INSERT
        WITH CHECK (bucket_id = 'assets');
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'assets_public_update'
    ) THEN
      CREATE POLICY assets_public_update
        ON storage.objects
        FOR UPDATE
        USING (bucket_id = 'assets')
        WITH CHECK (bucket_id = 'assets');
    END IF;
  END IF;
END $$;
