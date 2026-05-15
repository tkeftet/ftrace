import { z } from "zod";

export const baseTenantSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  slug: z
    .string()
    .min(2, { message: "Slug is required" })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers and hyphens",
    }),
  plan: z.enum(["free", "starter", "pro", "enterprise"], {
    message: "Plan is required",
  }),
  ownerName: z.string().min(1, { message: "Owner name is required" }),
  ownerEmail: z.string().email({ message: "Valid email is required" }),
  currency: z.string().min(1, { message: "Currency is required" }),
  timezone: z.string().min(1, { message: "Timezone is required" }),
});

export const addTenantSchema = baseTenantSchema.extend({
  ownerPassword: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export const editTenantSchema = baseTenantSchema.extend({
  ownerPassword: z.string().refine((val) => val === "" || val.length >= 6, {
    message: "Password must be at least 6 characters",
  }),
});

export type AddTenantFormValues = z.infer<typeof addTenantSchema>;
export type EditTenantFormValues = z.infer<typeof editTenantSchema>;
