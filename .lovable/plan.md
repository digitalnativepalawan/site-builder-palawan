

## Plan: Fix Mobile Preview with iframe + Responsive Issues

### Problem
The preview simulates mobile by narrowing a `<div>` container, but CSS media queries (`sm:`, `lg:`) respond to the **browser viewport**, not the container. This means all responsive behavior (hamburger menu, single columns, left alignment) never triggers in mobile preview mode.

### Solution
Wrap the site preview content in an `<iframe>` using `srcdoc` so CSS breakpoints respond to the iframe's actual width (375px for mobile, 768px for tablet).

### Implementation

**File: `src/pages/SitePreview.tsx`**

1. Extract the entire site content (header + sections + footer) into a standalone HTML string rendered via `<iframe srcdoc={...}>`.
2. The iframe gets `width: 375px` / `768px` / `100%` based on the device mode, so real CSS breakpoints activate correctly.
3. Include Tailwind CSS and Google Fonts in the iframe's `<head>`.
4. The hamburger menu, single-column grids, left-aligned text, and all responsive classes will work naturally since the iframe viewport IS the simulated device width.

**Alternative (simpler, no iframe):** Pass the `device` mode as a prop to all section renderers and the header/footer, and use JS-driven conditional classes instead of CSS breakpoints. E.g., `device === "mobile" ? "text-left" : "text-center"`. This avoids iframe complexity but requires touching every component.

### Recommended: Prop-based approach
The iframe approach requires duplicating all CSS/fonts in the iframe and handling scroll/navigation. The prop-based approach is simpler:

1. Pass `device` prop to all renderers and header/footer
2. Replace `sm:text-center` with `{device !== "mobile" ? "text-center" : "text-left"}`
3. Replace `sm:grid-cols-2` with `{device !== "mobile" ? "grid-cols-2" : "grid-cols-1"}`
4. Replace `hidden sm:flex` / `flex sm:hidden` with device checks
5. This ensures the hamburger menu, column stacking, and alignment all work correctly in preview

### Files Changed

| File | Change |
|------|--------|
| `src/components/preview/SectionRenderers.tsx` | Add `device` prop to all renderers, replace CSS breakpoints with device-conditional classes |
| `src/pages/SitePreview.tsx` | Pass `device` to all renderers and header/footer, fix hamburger visibility |

### Scope
- All 14 section renderers updated
- Header hamburger menu fixed
- Footer responsive layout fixed
- No database changes needed

