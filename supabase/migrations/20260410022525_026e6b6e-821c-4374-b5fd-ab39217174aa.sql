
-- Allow all access to sites for development
CREATE POLICY "Dev: allow all select on sites" ON public.sites FOR SELECT USING (true);
CREATE POLICY "Dev: allow all insert on sites" ON public.sites FOR INSERT WITH CHECK (true);
CREATE POLICY "Dev: allow all update on sites" ON public.sites FOR UPDATE USING (true);
CREATE POLICY "Dev: allow all delete on sites" ON public.sites FOR DELETE USING (true);

-- Allow all access to site_content for development
CREATE POLICY "Dev: allow all select on site_content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Dev: allow all insert on site_content" ON public.site_content FOR INSERT WITH CHECK (true);
CREATE POLICY "Dev: allow all update on site_content" ON public.site_content FOR UPDATE USING (true);
CREATE POLICY "Dev: allow all delete on site_content" ON public.site_content FOR DELETE USING (true);

-- Allow all access to site_settings for development
CREATE POLICY "Dev: allow all select on site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Dev: allow all insert on site_settings" ON public.site_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Dev: allow all update on site_settings" ON public.site_settings FOR UPDATE USING (true);
CREATE POLICY "Dev: allow all delete on site_settings" ON public.site_settings FOR DELETE USING (true);
