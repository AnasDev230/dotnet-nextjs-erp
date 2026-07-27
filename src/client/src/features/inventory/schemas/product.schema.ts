import { z } from "zod";

export const createProductSchema = z.object({
  sku: z
    .string()
    .min(1, "رمز المنتج مطلوب")
    .max(50, "رمز المنتج يجب ألا يتجاوز 50 حرفًا"),
  name: z
    .string()
    .min(1, "اسم المنتج مطلوب")
    .max(255, "اسم المنتج يجب ألا يتجاوز 255 حرفًا"),
  description: z.string().optional().or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
  unitOfMeasure: z.string().min(1, "وحدة القياس مطلوبة"),
  reorderLevel: z.number().min(0, "يجب أن يكون مستوى إعادة الطلب 0 أو أكثر"),
  reorderQty: z.number().min(0, "يجب أن تكون كمية إعادة الطلب 0 أو أكثر"),
});

export const updateProductSchema = z.object({
  name: z
    .string()
    .min(1, "اسم المنتج مطلوب")
    .max(255, "اسم المنتج يجب ألا يتجاوز 255 حرفًا"),
  description: z.string().optional().or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
  unitOfMeasure: z.string().min(1, "وحدة القياس مطلوبة"),
  reorderLevel: z.number().min(0, "يجب أن يكون مستوى إعادة الطلب 0 أو أكثر"),
  reorderQty: z.number().min(0, "يجب أن تكون كمية إعادة الطلب 0 أو أكثر"),
  isActive: z.boolean(),
});

export const productFormSchema = z.object({
  sku: z.string().optional().or(z.literal("")),
  name: z
    .string()
    .min(1, "اسم المنتج مطلوب")
    .max(255, "اسم المنتج يجب ألا يتجاوز 255 حرفًا"),
  description: z.string().optional().or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
  unitOfMeasure: z.string().min(1, "وحدة القياس مطلوبة"),
  reorderLevel: z.number().min(0, "يجب أن يكون مستوى إعادة الطلب 0 أو أكثر"),
  reorderQty: z.number().min(0, "يجب أن تكون كمية إعادة الطلب 0 أو أكثر"),
  isActive: z.boolean().optional(),
});

export type CreateProductFormData = z.infer<typeof createProductSchema>;
export type UpdateProductFormData = z.infer<typeof updateProductSchema>;
export type ProductFormData = z.infer<typeof productFormSchema>;
