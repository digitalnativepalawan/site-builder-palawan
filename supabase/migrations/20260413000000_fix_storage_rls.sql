-- ============================================================
-- RLS STORAGE POLICIES FOR resort-assets bucket
-- Fixes: "new row violates security policy" on image upload
-- Date: 2026-04-13
-- ============================================================

-- Ensure bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('resort-assets', 'resort-assets', true)
  ON CONFLICT (id) DO NOTHING;

-- ─── Drop existing policies (idempotent) ────────────────────
DROP POLICY IF EXISTS "Allow anon uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon read" ON storage.objects;

-- ─── INSERT: allow anyone to upload to resort-assets ───────
CREATE POLICY "anon_upload_resort_assets"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'resort-assets');

-- ─── SELECT: allow anyone to read from resort-assets ───────
CREATE POLICY "anon_read_resort_assets"
  ON storage.objects
  FOR SELECT
  TO anon
  USING (bucket_id = 'resort-assets');

-- ─── UPDATE: allow anyone to update (upsert) in resort-assets
-- This fixes the RLS error when SupabaseJS does upsert=true ─
CREATE POLICY "anon_update_resort_assets"
  ON storage.objects
  FOR UPDATE
  TO anon
  USING (bucket_id = 'resort-assets')
  WITH CHECK (bucket_id = 'resort-assets');

-- ─── DELETE: allow authenticated + service_role only ──────
CREATE POLICY "authenticated_delete_resort_assets"
  ON storage.objects
  FOR DELETE
  TO authenticated, service_role
  USING (bucket_id = 'resort-assets');
