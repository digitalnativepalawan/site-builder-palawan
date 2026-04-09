
-- Create sites table
CREATE TABLE public.sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_name TEXT NOT NULL,
  subdomain TEXT NOT NULL UNIQUE,
  template TEXT NOT NULL DEFAULT 'business' CHECK (template IN ('business', 'portfolio', 'blog')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create site_content table
CREATE TABLE public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL CHECK (section_type IN ('hero', 'text_block', 'image_gallery', 'video')),
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Sites policies
CREATE POLICY "Users can view their own sites" ON public.sites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sites" ON public.sites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sites" ON public.sites FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sites" ON public.sites FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Public can view published sites" ON public.sites FOR SELECT USING (status = 'published');

-- Site content policies
CREATE POLICY "Users can view content of their sites" ON public.site_content FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.sites WHERE sites.id = site_content.site_id AND sites.user_id = auth.uid())
);
CREATE POLICY "Users can create content for their sites" ON public.site_content FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.sites WHERE sites.id = site_content.site_id AND sites.user_id = auth.uid())
);
CREATE POLICY "Users can update content of their sites" ON public.site_content FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.sites WHERE sites.id = site_content.site_id AND sites.user_id = auth.uid())
);
CREATE POLICY "Users can delete content of their sites" ON public.site_content FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.sites WHERE sites.id = site_content.site_id AND sites.user_id = auth.uid())
);
CREATE POLICY "Public can view content of published sites" ON public.site_content FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.sites WHERE sites.id = site_content.site_id AND sites.status = 'published')
);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON public.sites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('site-assets', 'site-assets', true);

-- Storage policies
CREATE POLICY "Public can view site assets" ON storage.objects FOR SELECT USING (bucket_id = 'site-assets');
CREATE POLICY "Users can upload to their folder" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'site-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their files" ON storage.objects FOR UPDATE USING (bucket_id = 'site-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their files" ON storage.objects FOR DELETE USING (bucket_id = 'site-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
