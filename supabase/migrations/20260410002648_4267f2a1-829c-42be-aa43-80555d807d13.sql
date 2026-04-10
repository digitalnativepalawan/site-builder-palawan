
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE UNIQUE,
  colors jsonb NOT NULL DEFAULT '{}',
  typography jsonb NOT NULL DEFAULT '{}',
  layout jsonb NOT NULL DEFAULT '{}',
  buttons jsonb NOT NULL DEFAULT '{}',
  site_identity jsonb NOT NULL DEFAULT '{}',
  navigation jsonb NOT NULL DEFAULT '{}',
  social_links jsonb NOT NULL DEFAULT '{}',
  seo jsonb NOT NULL DEFAULT '{}',
  custom_css text DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view settings of their sites"
ON public.site_settings FOR SELECT
USING (EXISTS (
  SELECT 1 FROM sites WHERE sites.id = site_settings.site_id AND sites.user_id = auth.uid()
));

CREATE POLICY "Public can view settings of published sites"
ON public.site_settings FOR SELECT
USING (EXISTS (
  SELECT 1 FROM sites WHERE sites.id = site_settings.site_id AND sites.status = 'published'
));

CREATE POLICY "Users can create settings for their sites"
ON public.site_settings FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM sites WHERE sites.id = site_settings.site_id AND sites.user_id = auth.uid()
));

CREATE POLICY "Users can update settings of their sites"
ON public.site_settings FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM sites WHERE sites.id = site_settings.site_id AND sites.user_id = auth.uid()
));

CREATE POLICY "Users can delete settings of their sites"
ON public.site_settings FOR DELETE
USING (EXISTS (
  SELECT 1 FROM sites WHERE sites.id = site_settings.site_id AND sites.user_id = auth.uid()
));

CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
