

## Plan: Add Dark/Light Mode Toggle to Site Settings

### Overview
Add a theme mode setting (Light / Dark / Auto) to the Colors tab, stored in `site_settings`, and apply it in the public preview via CSS custom properties. No component rewrites needed — all sections automatically inherit the theme through CSS variables.

### 1. Database Migration
Add `theme_mode` text column to `site_settings` with default `'light'`.

```sql
ALTER TABLE public.site_settings ADD COLUMN theme_mode text NOT NULL DEFAULT 'light';
```

### 2. Types (`src/types/settings.ts`)
- Add `theme_mode: "light" | "dark" | "auto"` to `SiteSettingsData`
- Add default `theme_mode: "light"` to `getTemplateDefaults()`

### 3. Settings UI (`src/pages/SiteSettings.tsx`)
- In `parseSettings()`: read `theme_mode` from DB row
- In `saveMutation`: include `theme_mode` in the update payload
- In the **Colors tab** (after the existing color pickers): add a "Theme Mode" section with a `<Select>` offering Light / Dark / Auto
- Below the select, show a small preview card demonstrating how the dark/light choice looks with the user's current color palette

### 4. Preview (`src/pages/SitePreview.tsx`)
- Read `theme_mode` from settings row
- Define dark-mode CSS variable overrides as a `<style>` block or inline style object:
  - `--bg-color: #0f0f0f`, `--card-bg: #1a1a1a`, `--text-color: #e5e5e5`, `--heading-color: #ffffff`
- For `"auto"` mode, inject a `<style>` block using `@media (prefers-color-scheme: dark)` to conditionally apply dark variables
- For `"dark"` mode, always apply dark overrides
- For `"light"` mode, use existing colors as-is
- The existing `cssVars` object already sets `--bg-color`, `--text-color`, etc., so dark mode just overrides those values

### Files Changed

| File | Change |
|------|--------|
| `supabase/migrations/...` | Add `theme_mode` text column |
| `src/types/settings.ts` | Add `theme_mode` to types and defaults |
| `src/pages/SiteSettings.tsx` | Add theme mode select in Colors tab, parse/save |
| `src/pages/SitePreview.tsx` | Apply dark/auto CSS variable overrides |

