-- ═══════════════════════════════════════════════════════════════
-- RESORT SUBMISSIONS TABLE
-- Receives data from resort-form-full.html
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.resort_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'draft', 'processing', 'built', 'failed')),
  site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.resort_submissions ENABLE ROW LEVEL SECURITY;

-- Public can insert (form submissions from non-logged-in users)
CREATE POLICY "Anyone can submit resort form" ON public.resort_submissions
  FOR INSERT TO public WITH CHECK (true);

-- Anyone can read (for dev/admin purposes)
CREATE POLICY "Anyone can read submissions" ON public.resort_submissions
  FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can update submissions" ON public.resort_submissions
  FOR UPDATE TO public USING (true) WITH CHECK (true);

-- Updated_at trigger
CREATE TRIGGER update_resort_submissions_updated_at
  BEFORE UPDATE ON public.resort_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ═══════════════════════════════════════════════════════════════
-- AUTO-BUILD FUNCTION
-- Fires on INSERT to resort_submissions
-- Creates: site + site_settings + site_content (sections)
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_resort_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_site_id UUID;
  v_subdomain TEXT;
  v_resort_name TEXT;
  v_tagline TEXT;
  v_description TEXT;
  v_email TEXT;
  v_phone TEXT;
  v_address TEXT;
  v_primary_color TEXT;
  v_secondary_color TEXT;
  v_bg_color TEXT;
  v_heading_font TEXT;
  v_body_font TEXT;
  v_order INT;
BEGIN

  -- Only process pending/draft submissions
  IF NEW.status NOT IN ('pending', 'draft') THEN
    RETURN NEW;
  END IF;

  -- Extract key fields from submission JSON
  v_resort_name   := COALESCE(NEW.data->'basicInfo'->>'resortName', 'My Resort');
  v_tagline       := COALESCE(NEW.data->'basicInfo'->>'tagline', '');
  v_description   := COALESCE(NEW.data->'basicInfo'->>'shortDescription', '');
  v_email         := COALESCE(NEW.data->'location'->>'contactEmail', '');
  v_phone         := COALESCE(NEW.data->'location'->>'phone', '');
  v_address       := COALESCE(NEW.data->'location'->>'fullAddress', '');
  v_primary_color := COALESCE(NEW.data->'colorPalette'->>'primary', '#1E40AF');
  v_secondary_color := COALESCE(NEW.data->'colorPalette'->>'secondary', '#3B82F6');
  v_bg_color      := COALESCE(NEW.data->'colorPalette'->>'background', '#FFFFFF');
  v_heading_font  := COALESCE(NEW.data->'typography'->>'headingFont', 'Space Grotesk');
  v_body_font     := COALESCE(NEW.data->'typography'->>'bodyFont', 'Inter');

  -- Generate unique subdomain from resort name
  v_subdomain := lower(regexp_replace(v_resort_name, '[^a-zA-Z0-9]+', '-', 'g'));
  v_subdomain := trim(both '-' from v_subdomain);
  v_subdomain := v_subdomain || '-' || substr(gen_random_uuid()::text, 1, 6);

  -- Mark as processing
  NEW.status := 'processing';

  -- ── 1. Create the site ──────────────────────────────────────
  INSERT INTO public.sites (
    user_id,
    site_name,
    subdomain,
    template,
    status
  ) VALUES (
    '4f66ea34-fdde-44aa-8d98-99c2a5a89f16'::uuid, -- default dev user
    v_resort_name,
    v_subdomain,
    'business',
    CASE WHEN NEW.data->'publishing'->>'publishImmediately' = 'true' THEN 'published' ELSE 'draft' END
  )
  RETURNING id INTO v_site_id;

  -- ── 2. Create site_settings ─────────────────────────────────
  INSERT INTO public.site_settings (
    site_id,
    colors,
    typography,
    layout,
    site_identity,
    social_links,
    seo
  ) VALUES (
    v_site_id,
    jsonb_build_object(
      'primary', v_primary_color,
      'secondary', v_secondary_color,
      'background', v_bg_color,
      'text', COALESCE(NEW.data->'colorPalette'->>'text', '#0f172a'),
      'heading', COALESCE(NEW.data->'colorPalette'->>'heading', '#0f172a'),
      'accent', COALESCE(NEW.data->'colorPalette'->>'accent', '#f59e0b')
    ),
    jsonb_build_object(
      'headingFont', v_heading_font,
      'bodyFont', v_body_font,
      'fontScale', COALESCE(NEW.data->'typography'->>'fontScale', '1')
    ),
    jsonb_build_object(
      'layoutStyle', COALESCE(NEW.data->'layout'->>'layoutStyle', 'standard'),
      'contentWidth', COALESCE(NEW.data->'layout'->>'contentWidth', 'wide'),
      'borderRadius', COALESCE(NEW.data->'layout'->>'borderRadius', 'medium'),
      'buttonStyle', COALESCE(NEW.data->'layout'->>'buttonStyle', 'filled'),
      'headerStyle', COALESCE(NEW.data->'layout'->>'headerStyle', 'solid'),
      'headerSticky', COALESCE(NEW.data->'layout'->>'headerSticky', 'true')
    ),
    jsonb_build_object(
      'siteName', v_resort_name,
      'tagline', v_tagline,
      'email', v_email,
      'phone', v_phone,
      'address', v_address,
      'googleMapsLink', COALESCE(NEW.data->'location'->>'googleMapsLink', ''),
      'whatsapp', COALESCE(NEW.data->'location'->>'whatsapp', '')
    ),
    jsonb_build_object(
      'facebook', COALESCE(NEW.data->'location'->>'facebook', ''),
      'instagram', COALESCE(NEW.data->'location'->>'instagram', ''),
      'tiktok', COALESCE(NEW.data->'location'->>'tiktok', ''),
      'twitter', COALESCE(NEW.data->'location'->>'twitter', ''),
      'youtube', COALESCE(NEW.data->'location'->>'youtube', '')
    ),
    jsonb_build_object(
      'metaTitle', COALESCE(NEW.data->'seo'->>'metaTitle', v_resort_name),
      'metaDescription', COALESCE(NEW.data->'seo'->>'metaDescription', v_description),
      'metaKeywords', COALESCE(NEW.data->'seo'->>'metaKeywords', ''),
      'googleAnalyticsId', COALESCE(NEW.data->'seo'->>'googleAnalyticsId', '')
    )
  );

  -- ── 3. Create site_content sections ─────────────────────────
  v_order := 0;

  -- COVER / HERO
  INSERT INTO public.site_content (site_id, section_type, order_index, data)
  VALUES (v_site_id, 'cover', v_order, jsonb_build_object(
    'heading', v_resort_name,
    'subheading', v_tagline,
    'body', v_description,
    'cta', 'Book Now',
    'ctaLink', 'mailto:' || v_email
  ));
  v_order := v_order + 1;

  -- ABOUT / TEXT BLOCK (full description)
  IF COALESCE(NEW.data->'basicInfo'->>'fullDescription', '') != '' THEN
    INSERT INTO public.site_content (site_id, section_type, order_index, data)
    VALUES (v_site_id, 'text_block', v_order, jsonb_build_object(
      'heading', 'About ' || v_resort_name,
      'body', NEW.data->'basicInfo'->>'fullDescription'
    ));
    v_order := v_order + 1;
  END IF;

  -- AMENITIES as bullet_list
  IF jsonb_array_length(COALESCE(NEW.data->'amenities', '[]'::jsonb)) > 0 THEN
    INSERT INTO public.site_content (site_id, section_type, order_index, data)
    VALUES (v_site_id, 'bullet_list', v_order, jsonb_build_object(
      'heading', 'Amenities & Features',
      'items', NEW.data->'amenities'
    ));
    v_order := v_order + 1;
  END IF;

  -- ROOMS as pricing table
  IF jsonb_array_length(COALESCE(NEW.data->'roomTypes', '[]'::jsonb)) > 0 THEN
    INSERT INTO public.site_content (site_id, section_type, order_index, data)
    VALUES (v_site_id, 'pricing', v_order, jsonb_build_object(
      'heading', 'Rooms & Rates',
      'items', NEW.data->'roomTypes'
    ));
    v_order := v_order + 1;
  END IF;

  -- VIDEO (if provided)
  IF COALESCE(NEW.data->'media'->>'videoUrl', '') != '' THEN
    INSERT INTO public.site_content (site_id, section_type, order_index, data)
    VALUES (v_site_id, 'youtube', v_order, jsonb_build_object(
      'heading', 'See ' || v_resort_name,
      'videoUrl', NEW.data->'media'->>'videoUrl',
      'caption', ''
    ));
    v_order := v_order + 1;
  END IF;

  -- LOCATION / CONTACT
  IF v_email != '' OR v_phone != '' OR v_address != '' THEN
    INSERT INTO public.site_content (site_id, section_type, order_index, data)
    VALUES (v_site_id, 'contact_form', v_order, jsonb_build_object(
      'heading', 'Get In Touch',
      'subheading', 'We''d love to hear from you',
      'email', v_email,
      'phone', v_phone,
      'address', v_address,
      'googleMapsLink', COALESCE(NEW.data->'location'->>'googleMapsLink', ''),
      'whatsapp', COALESCE(NEW.data->'location'->>'whatsapp', '')
    ));
    v_order := v_order + 1;
  END IF;

  -- FAQs
  IF jsonb_array_length(COALESCE(NEW.data->'faqs', '[]'::jsonb)) > 0 THEN
    INSERT INTO public.site_content (site_id, section_type, order_index, data)
    VALUES (v_site_id, 'faq', v_order, jsonb_build_object(
      'heading', 'Frequently Asked Questions',
      'faqs', NEW.data->'faqs'
    ));
    v_order := v_order + 1;
  END IF;

  -- ── 4. Link submission to site and mark built ───────────────
  NEW.site_id := v_site_id;
  NEW.status := 'built';

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- Log error but don't crash
  NEW.status := 'failed';
  NEW.error_message := SQLERRM;
  RETURN NEW;
END;
$$;

-- Attach trigger to resort_submissions
CREATE TRIGGER on_resort_submission_created
  BEFORE INSERT ON public.resort_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_resort_submission();

