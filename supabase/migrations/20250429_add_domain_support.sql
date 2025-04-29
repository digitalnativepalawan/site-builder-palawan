-- Custom domain support for resort sites
-- Run this in Supabase SQL Editor (kektzjtsdpgduvvjfrig.supabase.co)

ALTER TABLE sites
  ADD COLUMN custom_domain TEXT UNIQUE,
  ADD COLUMN domain_registered BOOLEAN DEFAULT FALSE,
  ADD COLUMN domain_provider TEXT,
  ADD COLUMN domain_expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN ssl_status TEXT DEFAULT 'pending'
    CHECK (ssl_status IN ('pending','active','expired','failed')),
  ADD COLUMN hosting_plan TEXT DEFAULT 'free'
    CHECK (hosting_plan IN ('free','pro','business')),
  ADD COLUMN vercel_project_id TEXT;

-- Fast lookup by domain
CREATE INDEX idx_sites_custom_domain ON sites(custom_domain) WHERE custom_domain IS NOT NULL;

-- Auto-clear subdomain when a custom domain is set
CREATE OR REPLACE FUNCTION clean_subdomain_on_custom_domain()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.custom_domain IS NOT NULL AND NEW.custom_domain <> '' THEN
    NEW.subdomain = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_clean_subdomain
  BEFORE INSERT OR UPDATE ON sites
  FOR EACH ROW
  EXECUTE FUNCTION clean_subdomain_on_custom_domain();
