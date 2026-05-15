import { z } from "zod";

export const createStaffSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Minimum 6 characters"),
  role: z.enum(["manager", "waiter", "barman", "kitchen", "cashier"] as const),
});

export const editStaffSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.enum([
    "admin",
    "manager",
    "waiter",
    "barman",
    "kitchen",
    "cashier",
  ] as const),
  password: z
    .string()
    .min(6, "Minimum 6 characters")
    .optional()
    .or(z.literal("")),
});

export type CreateStaffForm = z.infer<typeof createStaffSchema>;
export type EditStaffForm = z.infer<typeof editStaffSchema>;
