import { z } from "zod";

export const createCategorySchema = z.object({
  code: z
    .string()
    .min(1, "رمز التصنيف مطلوب")
    .max(50, "رمز التصنيف يجب ألا يتجاوز 50 حرفًا"),
  name: z
    .string()
    .min(1, "اسم التصنيف مطلوب")
    .max(255, "اسم التصنيف يجب ألا يتجاوز 255 حرفًا"),
  parentId: z.string().optional().or(z.literal("")),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, "اسم التصنيف مطلوب")
    .max(255, "اسم التصنيف يجب ألا يتجاوز 255 حرفًا"),
  parentId: z.string().optional().or(z.literal("")),
});

export const categoryFormSchema = z.object({
  code: z.string().optional().or(z.literal("")),
  name: z
    .string()
    .min(1, "اسم التصنيف مطلوب")
    .max(255, "اسم التصنيف يجب ألا يتجاوز 255 حرفًا"),
  parentId: z.string().optional().or(z.literal("")),
});

export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;
export type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>;
export type CategoryFormData = z.infer<typeof categoryFormSchema>;
