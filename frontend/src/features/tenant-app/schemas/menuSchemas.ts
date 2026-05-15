import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  displayOrder: z.number().int().min(0),
});

export const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be ≥ 0"),
  target: z.enum(["bar", "kitchen"] as const),
  preparationTime: z.number().int().min(0).optional(),
  image: z.string().optional(),
});

export type CategoryForm = z.infer<typeof categorySchema>;
export type ItemForm = z.infer<typeof itemSchema>;
