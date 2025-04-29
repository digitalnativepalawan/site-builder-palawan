import { z } from 'zod';

/* ── Existing schemas (placeholders – adjust to match your actual schemas) ── */

export const identitySchema = z.object({
  resortName: z.string().min(1, 'Resort name is required'),
  tagline: z.string().optional(),
  shortDescription: z.string().max(200, 'Too long'),
  fullDescription: z.string().optional(),
});

export const mediaSchema = z.object({
  heroImages: z.array(z.string()).optional(),
  galleryImages: z.array(z.string()).optional(),
  videoUrl: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
});

export const amenitiesSchema = z.object({
  features: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  roomDetails: z.object({
    ac: z.boolean(),
    hotWater: z.boolean(),
    wifi: z.string(),
    breakfast: z.boolean(),
    totalRooms: z.number(),
  }),
  dining: z.array(z.string()).optional(),
});

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

export type IdentityValues = z.infer<typeof identitySchema>;
export type MediaValues = z.infer<typeof mediaSchema>;
export type AmenitiesValues = z.infer<typeof amenitiesSchema>;
export type DomainFormValues = z.infer<typeof domainSchema>;
