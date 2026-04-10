

## Plan: Site Settings Page + Device Preview Toolbar

### 1. Database Migration

Create `site_settings` table with RLS policies matching the `sites` table ownership pattern:

```sql
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
```

RLS: owners can CRUD via `sites.user_id = auth.uid()`, public can SELECT for published sites.

### 2. New Files

| File | Purpose |
|------|---------|
| `src/pages/SiteSettings.tsx` | Settings page with 8 tabs (Colors, Typography, Layout, Buttons, Identity, Navigation, Social, SEO/CSS) |
| `src/types/settings.ts` | TypeScript interfaces for each settings JSONB column + template defaults |

### 3. Modified Files

| File | Change |
|------|--------|
| `src/App.tsx` | Add route `/sites/:siteId/settings` → `SiteSettings` |
| `src/pages/SiteEditor.tsx` | Add "Settings" button in top bar linking to settings page |
| `src/pages/SitePreview.tsx` | Fetch `site_settings`, apply as CSS variables + inline styles; add device preview toolbar (mobile/tablet/desktop buttons with iframe resize) |

### 4. Settings Page Details

- **8 shadcn Tabs** in a scrollable layout
- Each tab loads/saves its respective JSONB column
- On first visit, auto-creates a `site_settings` row with template-specific defaults (Blog/Portfolio/Business)
- Color pickers use native `<input type="color">`
- Font dropdowns use shadcn Select
- Upload fields (logo, favicon, OG image) use existing Supabase Storage upload pattern
- Nav links manager: dynamic list with add/remove/reorder
- Social links: 6 platform rows with URL input + show/hide Switch
- Save button persists all tabs at once

### 5. Device Preview Toolbar

- Fixed bar at top of preview page with 3 buttons: Mobile (375px), Tablet (768px), Desktop (100%)
- Wraps the site content in an iframe or a `<div>` with constrained `max-width` + centered layout
- "Back to Editor" button included

### 6. Applying Settings to Public Site

In `SitePreview.tsx`:
- Query `site_settings` alongside site data
- Inject CSS variables on a wrapper div: `--color-primary`, `--color-bg`, `--color-text`, `--color-heading`, `--color-card-bg`
- Apply font families via inline style on wrapper
- Apply content width, spacing, border radius as CSS variables
- Inject `custom_css` via a `<style>` tag
- Section renderers read these CSS variables instead of hardcoded template classes

### 7. Template Defaults

Stored in `src/types/settings.ts` and used when auto-creating settings:

- **Blog**: Playfair Display headings, Lora body, relaxed spacing, narrow width, sharp radius
- **Portfolio**: Montserrat headings, Inter body, comfortable spacing, wide width, sharp radius  
- **Business**: Inter headings, Inter body, comfortable spacing, standard width, 4px radius

Each template also gets matching default colors derived from the existing `templateStyles` object.

