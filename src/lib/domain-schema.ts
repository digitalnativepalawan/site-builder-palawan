import { z } from 'zod';

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
