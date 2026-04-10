

## Plan: Mobile Hamburger Menu, Color Sync, Social Icons, and Mobile Responsive Fixes

### Overview
Four interconnected changes: (1) hamburger menu for mobile header, (2) remove color pickers from header/footer tabs and derive colors from the Colors tab, (3) social icon display in header/footer with settings, (4) comprehensive mobile responsive fixes for all section renderers.

### 1. Remove Color Pickers from Header & Footer Tabs (`SiteSettings.tsx`)

- **Header tab** (line 642-645): Remove the `bgColor` color picker. Add a note: "Header uses Card Background color from the Colors tab."
- **Footer tab** (line 713-715): Remove the `bgColor` color picker. Add a note: "Footer uses a dark variant of your Primary color."
- Preview (`SitePreview.tsx`): Header uses `colors.cardBg` for background. Footer uses `colors.primary` (or a darkened variant). Auto-calculate contrasting text color (light text on dark bg, dark on light).

### 2. Social Icons in Header & Footer

**Types** (`src/types/settings.ts`):
- Add to `SocialLink`: `showInHeader: boolean` (default false), `showInFooter: boolean` (default true)
- Add to `SiteSettingsData` or a new field: `socialIconStyle: "rounded" | "square" | "text"` (default "rounded")

**Settings UI** (`SiteSettings.tsx`, Social tab):
- Add "Show social icons in header" toggle
- Add "Show social icons in footer" toggle  
- Add "Icon style" select: Rounded / Square / Just text

**Preview** (`SitePreview.tsx`):
- Render visible social links as icons (using Lucide icons for Twitter/GitHub/LinkedIn or simple SVG) in header (next to CTA) and footer (own column)

### 3. Mobile Hamburger Menu (`SitePreview.tsx`)

- Add a hamburger icon button visible at `sm:` breakpoint and below
- On click, toggle a full-width dropdown/slide-down with nav links stacked vertically, CTA button full-width, and social icons
- Desktop: unchanged layout. Mobile: logo + hamburger only in the header bar

### 4. Mobile Responsive Fixes (`SectionRenderers.tsx`)

Apply consistent mobile rules to ALL section renderers:

| Rule | Implementation |
|------|---------------|
| Full width | `px-5` on mobile (20px), responsive `sm:px-6 lg:px-8` |
| Left align on mobile | `text-left sm:text-center` where center is used |
| 1-column grids | Already using `grid-cols-1 sm:grid-cols-2` — verify all |
| Full-width images | `w-full h-auto` — verify |
| Consistent gap | `py-12` (48px) on all sections |
| Font sizes | Explicit `text-[28px] sm:text-3xl lg:text-4xl` for headlines, `text-base` min for body |
| Buttons | `w-full sm:w-auto` + `min-h-[44px]` + vertical stack on mobile |
| No horizontal scroll | `overflow-x-hidden` on wrapper, `max-w-full` on all containers |

**Sections to update:**
- **CoverSection**: Left-align text on mobile, stack buttons vertically, ensure headline 28px min
- **TextSection**: Already mostly fine, verify padding
- **PhotoSection**: Ensure full-width image
- **BulletListSection**: Force single column on mobile regardless of `two-col` setting
- **PricingSection**: Force `grid-cols-1` on mobile
- **FaqSection**: Verify padding consistency
- **TwoColumnsSection**: Already stacks, verify gap
- **KeyNumbersSection**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- **NumberCardsSection**: `grid-cols-1` on mobile
- **TimelineSection**: Full-width events
- **YoutubeSection**: Full-width video
- **ContactFormSection**: Full-width inputs (already done)
- **CtaSection**: Left-align on mobile, full-width button
- **Header/Footer**: Hamburger menu handles this

### Files Changed

| File | Change |
|------|--------|
| `src/types/settings.ts` | Add `socialIconStyle`, update `SocialLink` with header/footer toggles |
| `src/pages/SiteSettings.tsx` | Remove color pickers from header/footer tabs, add social display options |
| `src/pages/SitePreview.tsx` | Color sync, hamburger menu, social icons in header/footer |
| `src/components/preview/SectionRenderers.tsx` | Mobile responsive fixes for all 14 section types |

