

## Plan: Update Site Editor to 5 Simple Block Types

### Summary
Replace the current 4 section types (hero, text_block, image_gallery, video) with 5 new block types: **Hero**, **Text Block**, **Image Gallery**, **Split Layout**, and **Grid/Cards**. The Hero block is always present and non-deletable. The "video" type is removed.

### Data Model Changes

No database migration needed -- the `site_content` table already stores `section_type` (text) and `data` (jsonb), which is flexible enough. We just change the types and data shapes used in code.

New `SectionData` interface covers all block types:

```text
Hero:        headline, subheadline, body, buttonText, buttonUrl, buttonText2, buttonUrl2, backgroundImage
Text Block:  headline, body, alignment (left|center), width (narrow|normal), background (white|light-gray)
Image Gallery: images[], layout (single|2-col|3-col)
Split Layout: headline, body, imageUrl, imageAlt, imagePosition (left|right), buttonText, buttonUrl
Grid/Cards:  headline, cards[] (each: image, title, subtitle, description), columns (2|3|4)
```

### Editor Changes (SiteEditor.tsx)

1. **Replace section types** -- remove "video", add "split_layout" and "grid_cards"
2. **Hero enforcement** -- auto-create hero at order_index 0 if none exists; hide delete button on hero; hero always shows first in the list
3. **Add Block picker** -- 4 buttons: Text Block, Image Gallery, Split Layout, Grid/Cards (no Hero button since it's auto-created)
4. **Edit panel per block type**:
   - **Text Block**: headline, body textarea, alignment select (left/center), width select (narrow/normal), background select (white/light gray)
   - **Image Gallery**: image upload (existing logic), layout select (single/2-col/3-col), caption inputs
   - **Split Layout**: image upload (single), image position toggle (left/right), headline, body, optional button
   - **Grid/Cards**: headline, dynamic card list (add/remove cards), each card has image upload, title, subtitle, description, columns select (2/3/4)
   - **Hero**: headline, subheadline, body, two CTA buttons (text+url), background image upload
5. **Reorder** -- keep existing up/down arrow approach (drag-to-reorder via @dnd-kit is a separate enhancement)

### Preview Changes (SitePreview.tsx)

1. **Remove** `VideoSection`
2. **Add** `SplitLayoutSection` -- flexbox row, image on one side, text on other, stacks vertically on mobile
3. **Add** `GridCardsSection` -- responsive CSS grid (1 col mobile, 2 col tablet, user-chosen cols desktop), each card with image, title, subtitle, description
4. **Update** `TextSection` -- respect alignment, width, background props
5. **Update** `HeroSection` -- support background image and second CTA button
6. **Update** `ImageGallerySection` -- respect layout prop (single/2-col/3-col) instead of auto 1-2-3-4 grid

### Files Modified

| File | Changes |
|------|---------|
| `src/pages/SiteEditor.tsx` | Full rewrite of block types, edit forms, hero enforcement |
| `src/pages/SitePreview.tsx` | Add split/grid renderers, update text/hero/gallery renderers |

### Technical Details

- Existing hero/text_block/image_gallery data in the DB remains compatible (new fields are optional)
- Old "video" sections in DB will render as null (graceful fallback)
- Image uploads reuse existing Supabase Storage logic
- No new dependencies needed

