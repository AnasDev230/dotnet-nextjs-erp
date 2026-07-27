import { z } from "zod";

export const createWarehouseSchema = z.object({
  code: z
    .string()
    .min(1, "الرمز مطلوب")
    .max(50, "الرمز يجب ألا يتجاوز 50 حرفًا"),
  name: z
    .string()
    .min(1, "الاسم مطلوب")
    .max(255, "الاسم يجب ألا يتجاوز 255 حرفًا"),
  location: z
    .string()
    .max(500, "الموقع يجب ألا يتجاوز 500 حرفًا")
    .optional()
    .or(z.literal("")),
});

export const updateWarehouseSchema = z.object({
  name: z
    .string()
    .min(1, "الاسم مطلوب")
    .max(255, "الاسم يجب ألا يتجاوز 255 حرفًا"),
  location: z
    .string()
    .max(500, "الموقع يجب ألا يتجاوز 500 حرفًا")
    .optional()
    .or(z.literal("")),
  isActive: z.boolean(),
});

export const warehouseFormSchema = z.object({
  code: z.string().optional().or(z.literal("")),
  name: z
    .string()
    .min(1, "الاسم مطلوب")
    .max(255, "الاسم يجب ألا يتجاوز 255 حرفًا"),
  location: z
    .string()
    .max(500, "الموقع يجب ألا يتجاوز 500 حرفًا")
    .optional()
    .or(z.literal("")),
  isActive: z.boolean().optional(),
});

export type CreateWarehouseFormData = z.infer<typeof createWarehouseSchema>;
export type UpdateWarehouseFormData = z.infer<typeof updateWarehouseSchema>;
export type WarehouseFormData = z.infer<typeof warehouseFormSchema>;
