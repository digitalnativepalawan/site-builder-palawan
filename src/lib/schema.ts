import { z } from "zod";

// ──────────────────────────────────────────────
// Step 1 — Identity / Basic Info (ANCHOR)
// ──────────────────────────────────────────────
export const identitySchema = z.object({
  resortName: z.string().min(2, "At least 2 characters").max(120, "Too long"),
  resortOwner: z.string().min(2, "At least 2 characters"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Valid phone required"),
  resortType: z.enum(["boutique", "resort", "villa", "hostel", "hotel", "eco-lodge"]),
});

export type IdentityValues = z.infer<typeof identitySchema>;

// ──────────────────────────────────────────────
// Step 2 — Media / Gallery
// ──────────────────────────────────────────────
export const mediaSchema = z.object({
  logoUrl: z.string().url("Valid URL required").or(z.literal("")),
  coverImageUrl: z.string().url("Valid URL required").or(z.literal("")),
  websiteUrl: z.string().url("Valid URL required").or(z.literal("")),
  videoUrl: z.string().url("Valid URL required").or(z.literal("")),
  galleryImages: z
    .array(
      z.object({
        url: z.string().url(),
        alt: z.string().optional(),
      })
    )
    .optional(),
});

export type MediaValues = z.infer<typeof mediaSchema>;
