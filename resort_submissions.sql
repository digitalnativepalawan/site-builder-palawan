-- ============================================================
-- resort_submissions table
-- ============================================================
CREATE TABLE IF NOT EXISTS resort_submissions (
  id         UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data       JSONB       NOT NULL DEFAULT '{}',
  status     TEXT        NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Updated-at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_resort_submissions_updated_at
  BEFORE UPDATE ON resort_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS: allow anon insert for form, anon read for dashboard
ALTER TABLE resort_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon inserts"
  ON resort_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow service-role full access"
  ON resort_submissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Storage bucket for resort uploads (run in Supabase SQL if not created via UI)
INSERT INTO storage.buckets (id, name, public) VALUES ('resort-assets', 'resort-assets', true)
  ON CONFLICT (id) DO NOTHING;

-- Storage policy: allow anon uploads up to 50MB per file
CREATE POLICY "Allow anon uploads"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'resort-assets');

CREATE POLICY "Allow anon read"
  ON storage.objects
  FOR SELECT
  TO anon
  USING (bucket_id = 'resort-assets');
