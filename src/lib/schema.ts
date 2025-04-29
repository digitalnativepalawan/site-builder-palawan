// ═══════════════════════════════════════════════════════
// 13-SECTION WIZARD SCHEMA
// ═══════════════════════════════════════════════════════
import { z } from "zod";

// Step 1: Identity
export const identitySchema = z.object({
  resortName: z.string().min(2, "At least 2 characters").max(120, "Too long"),
  resortOwner: z.string().min(2, "At least 2 characters"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Valid phone required"),
  resortType: z.enum(["boutique", "resort", "villa", "hostel", "hotel", "eco-lodge"], {
    message: "Select a resort type",
  }),
});
export type IdentityValues = z.infer<typeof identitySchema>;

// Step 2: Brand Story
export const brandStorySchema = z.object({
  tagline: z.string().max(120).optional().default(""),
  shortDescription: z.string().max(500).optional().default(""),
  fullDescription: z.string().max(2000).optional().default(""),
  missionStatement: z.string().max(500).optional().default(""),
});
export type BrandStoryValues = z.infer<typeof brandStorySchema>;

// Step 3: About the Owner
export const aboutOwnerSchema = z.object({
  ownerBio: z.string().max(1000).optional().default(""),
  ownerPhotoUrl: z.string().url().optional().or(z.literal("")).default(""),
});
export type AboutOwnerValues = z.infer<typeof aboutOwnerSchema>;

// Step 4: Media & Branding
export const mediaSchema = z.object({
  heroImages: z.array(z.string().min(1, "Must be a non-empty URL")).optional().default([]),
  galleryImages: z.array(z.string().min(1, "Must be a non-empty URL")).optional().default([]),
  logoUrl: z.string().min(1, "Must be a non-empty URL").optional().or(z.literal("")).default(""),
});
export type MediaValues = z.infer<typeof mediaSchema>;

// Step 5: Hero Video
export const heroVideoSchema = z.object({
  videoUrl: z.string().url("Must be a valid YouTube/Vimeo URL").optional().or(z.literal("")).default(""),
  videoAutoplay: z.boolean().optional().default(true),
  videoCaption: z.string().max(120).optional().default(""),
});
export type HeroVideoValues = z.infer<typeof heroVideoSchema>;

// Step 6: Rooms & Villas
export const roomsSchema = z.object({
  roomTypes: z.array(z.object({
    name: z.string().min(1, "Room name required"),
    description: z.string().max(500).optional().default(""),
    price: z.string().optional().default(""),
    maxGuests: z.coerce.number().min(1).optional().default(2),
    amenities: z.array(z.string()).optional().default([]),
    imageUrl: z.string().url().optional().or(z.literal("")).default(""),
  })).optional().default([]),
});
export type RoomsValues = z.infer<typeof roomsSchema>;

// Step 7: Guest Comforts & Technical Amenities
export const amenitiesSchema = z.object({
  tags: z.array(z.string()).optional().default([]),
  features: z.array(z.string()).optional().default([]),
  roomDetails: z.object({
    ac: z.boolean().default(false),
    hotWater: z.boolean().default(false),
    wifi: z.string().optional().default(""),
    breakfast: z.boolean().default(false),
    totalRooms: z.coerce.number().min(0).optional().default(0),
    solarPower: z.boolean().default(false),
    starlink: z.boolean().default(false),
    fiberInternet: z.boolean().default(false),
  }),
  dining: z.array(z.string()).optional().default([]),
});
export type AmenitiesValues = z.infer<typeof amenitiesSchema>;

// Step 8: Dining & Experiences
export const diningSchema = z.object({
  diningOptions: z.array(z.object({
    name: z.string().min(1, "Name required"),
    description: z.string().max(300).optional().default(""),
    type: z.enum(["restaurant", "bar", "cafe", "room-service", "pool-bar"]).optional().default("restaurant"),
  })).optional().default([]),
  experiences: z.array(z.string()).optional().default([]),
});
export type DiningValues = z.infer<typeof diningSchema>;

// Step 9: FAQ Section
export const faqSchema = z.object({
  faqs: z.array(z.object({
    question: z.string().min(2, "Question required"),
    answer: z.string().min(10, "Answer too short"),
  })).optional().default([]),
});
export type FAQValues = z.infer<typeof faqSchema>;

// Step 10: Header & Footer Settings
export const headerFooterSchema = z.object({
  headerStyle: z.enum(["solid", "transparent", "minimal"]).optional().default("transparent"),
  headerSticky: z.boolean().optional().default(true),
  footerStyle: z.enum(["full", "minimal", "compact"]).optional().default("full"),
  footerCopyright: z.string().max(100).optional().default(""),
  showBackToTop: z.boolean().optional().default(true),
});
export type HeaderFooterValues = z.infer<typeof headerFooterSchema>;

// Step 11: Contact & Location
export const contactSchema = z.object({
  fullAddress: z.string().max(300).optional().default(""),
  googleMapsLink: z.string().url().optional().or(z.literal("")).default(""),
  whatsapp: z.string().max(20).optional().default(""),
  facebook: z.string().url().optional().or(z.literal("")).default(""),
  instagram: z.string().url().optional().or(z.literal("")).default(""),
  tiktok: z.string().url().optional().or(z.literal("")).default(""),
  checkInTime: z.string().optional().default("14:00"),
  checkOutTime: z.string().optional().default("11:00"),
});
export type ContactValues = z.infer<typeof contactSchema>;

// Step 12: Color Palette & Typography
export const colorPaletteSchema = z.object({
  primary: z.string().default("#B8860B"),
  secondary: z.string().default("#1E40AF"),
  accent: z.string().default("#F59E0B"),
  background: z.string().default("#FFFFFF"),
  text: z.string().default("#0f172a"),
  heading: z.string().default("#0f172a"),
  headingFont: z.string().default("Space Grotesk"),
  bodyFont: z.string().default("Inter"),
});
export type ColorPaletteValues = z.infer<typeof colorPaletteSchema>;

// Step 13: SEO & Generation
export const seoSchema = z.object({
  metaTitle: z.string().max(60).optional().default(""),
  metaDescription: z.string().max(160).optional().default(""),
  metaKeywords: z.string().optional().default(""),
  googleAnalyticsId: z.string().optional().default(""),
  publishImmediately: z.boolean().optional().default(false),
});
export type SEOValues = z.infer<typeof seoSchema>;

// Aliases for compatibility
export { identitySchema as basicInfoSchema };
export type { IdentityValues as BasicInfoValues };


/* ── Domain Step ─────────────────────────────────────────────────── */

export const domainSchema = z
  .object({
    purchaseDomain: z.boolean().default(false),
    customDomain: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[a-z0-9][a-z0-9-]*(\.[a-z]+)+$/i.test(val),
        { message: 'Enter a valid domain (e.g. yourdomain.com)' }
      ),
  })
  .refine(
    (data) => {
      if (data.purchaseDomain) {
        return !!data.customDomain && data.customDomain.length > 0;
      }
      return true;
    },
    {
      message: 'Domain name is required when purchasing',
      path: ['customDomain'],
    }
  );

export type DomainFormValues = z.infer<typeof domainSchema>;
