ALTER TABLE public.site_settings
  ADD COLUMN header_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN footer_settings jsonb NOT NULL DEFAULT '{}'::jsonb;