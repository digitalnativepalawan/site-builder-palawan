
ALTER TABLE public.site_content DROP CONSTRAINT site_content_section_type_check;

ALTER TABLE public.site_content ADD CONSTRAINT site_content_section_type_check
CHECK (section_type = ANY (ARRAY[
  'hero', 'cover', 'text_block', 'photo', 'image_gallery',
  'bullet_list', 'pricing', 'faq', 'two_columns',
  'key_numbers', 'number_cards', 'timeline',
  'youtube', 'video', 'contact_form', 'separator', 'cta',
  'split_layout', 'grid_cards'
]));
