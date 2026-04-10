

## Plan: Add Header and Footer Settings Tabs

### Overview
Add two new tabs ("Header" and "Footer") to the Site Settings page, backed by two new JSONB columns in the `site_settings` table. The public preview will read and apply these settings.

### 1. Database Migration
Add `header_settings` and `footer_settings` JSONB columns (default `'{}'`) to `site_settings`.

### 2. TypeScript Types (`src/types/settings.ts`)
Add interfaces:
```typescript
interface HeaderSettings {
  visible: boolean;           // default true
  sticky: boolean;            // default false
  bgColor: string;            // default "#ffffff"
  layout: "logo-left" | "logo-center";  // default "logo-left"
  height: "60px" | "72px" | "80px";     // default "72px"
  ctaVisible: boolean;        // default false
  ctaText: string;
  ctaLink: string;
}

interface FooterSettings {
  visible: boolean;           // default true
  columns: 2 | 3 | 4;        // default 3
  showLogo: boolean;          // default false
  copyrightText: string;      // default "© {year} {site name}"
  bgColor: string;            // default "#1e293b"
  showBackToTop: boolean;     // default false
}
```
Add defaults to `SiteSettingsData` and `getTemplateDefaults`.

### 3. Settings UI (`src/pages/SiteSettings.tsx`)
- Add "header" and "footer" to the tab list
- Parse `header_settings` and `footer_settings` in `parseSettings()`
- Include both in `saveMutation`
- **Header tab**: show/hide toggle, sticky toggle, color picker, layout select, height select, CTA section with text/link inputs
- **Footer tab**: show/hide toggle, columns select, show logo toggle, copyright text input (with `{year}`/`{site name}` placeholder hint), color picker, back-to-top toggle

### 4. Public Preview (`src/pages/SitePreview.tsx`)
- Read `header_settings` and `footer_settings` from the settings row
- **Header**: Conditionally render based on `visible`. Apply `sticky top-0 z-50`, background color, height, layout mode. Show CTA button if enabled. Render nav links from existing navigation settings.
- **Footer**: Conditionally render based on `visible`. Apply background color, column layout, logo, copyright text (replace `{year}` and `{site name}` dynamically), and a "Back to Top" scroll button.

### Files Changed
| File | Change |
|------|--------|
| `supabase/migrations/...` | Add 2 JSONB columns |
| `src/types/settings.ts` | Add interfaces + defaults |
| `src/pages/SiteSettings.tsx` | Add 2 tabs, parse/save logic |
| `src/pages/SitePreview.tsx` | Render header/footer from settings |

