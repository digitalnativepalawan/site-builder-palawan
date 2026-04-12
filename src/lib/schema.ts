import { z } from "zod";

export const basicInfoSchema = z.object({
  resortName: z.string().min(2, "At least 2 characters").max(120, "Too long"),
  resortOwner: z.string().min(2, "At least 2 characters"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Valid phone required"),
  resortType: z.enum(["boutique", "resort", "villa", "hostel", "hotel", "eco-lodge"], {
    message: "Select a resort type",
  }),
});
export type BasicInfoValues = z.infer<typeof basicInfoSchema>;

export const mediaSchema = z.object({
  heroImages: z.array(z.string().url("Must be a valid URL")).optional().default([]),
  galleryImages: z.array(z.string().url("Must be a valid URL")).optional().default([]),
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")).default(""),
});
export type MediaValues = z.infer<typeof mediaSchema>;
