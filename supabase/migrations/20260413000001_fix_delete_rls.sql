-- ═══════════════════════════════════════════════════════════════
-- FIX: Allow DELETE on resort_submissions + resort-assets cleanup
-- Fixes: Dashboard Delete button silently failing (RLS)
-- Date: 2026-04-13
-- ═══════════════════════════════════════════════════════════════

-- ── 1. DELETE policy for resort_submissions (anon) ────────────
-- The existing policies only allow INSERT, SELECT, UPDATE for anon.
-- Without this, supabase.delete() from the dashboard silently fails.
DROP POLICY IF EXISTS "anon_delete_resort_submissions" ON public.resort_submissions;

CREATE POLICY "anon_delete_resort_submissions"
  ON public.resort_submissions
  FOR DELETE
  TO anon
  USING (true);

-- ── 2. DELETE policy for resort-assets storage bucket ─────────
-- Allows anon to remove uploaded images when deleting a resort.
DROP POLICY IF EXISTS "anon_delete_resort_assets" ON storage.objects;

CREATE POLICY "anon_delete_resort_assets"
  ON storage.objects
  FOR DELETE
  TO anon
  USING (bucket_id = 'resort-assets');
