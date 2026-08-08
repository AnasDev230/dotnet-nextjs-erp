import { z } from "zod";

export const createProductSupplierSchema = z.object({
  productId: z.string().min(1, "المنتج مطلوب"),
  supplierId: z.string().min(1, "المورد مطلوب"),
  supplierSku: z
    .string()
    .max(100, "رمز المورد للصنف يجب ألا يتجاوز 100 حرفًا")
    .optional()
    .or(z.literal("")),
  leadTimeDays: z.coerce
    .number()
    .int("مدة التسليم يجب أن تكون عددًا صحيحًا")
    .min(0, "مدة التسليم يجب ألا تكون سالبة"),
  minOrderQty: z.coerce
    .number()
    .min(0, "الحد الأدنى للكمية يجب ألا يكون سالبًا"),
  unitCost: z.coerce
    .number()
    .positive("تكلفة الوحدة يجب أن تكون أكبر من صفر"),
  isPrimary: z.boolean().default(false),
});

export const updateProductSupplierSchema = z.object({
  supplierSku: z
    .string()
    .max(100, "رمز المورد للصنف يجب ألا يتجاوز 100 حرفًا")
    .optional()
    .or(z.literal("")),
  leadTimeDays: z.coerce
    .number()
    .int("مدة التسليم يجب أن تكون عددًا صحيحًا")
    .min(0, "مدة التسليم يجب ألا تكون سالبة"),
  minOrderQty: z.coerce
    .number()
    .min(0, "الحد الأدنى للكمية يجب ألا يكون سالبًا"),
  unitCost: z.coerce
    .number()
    .positive("تكلفة الوحدة يجب أن تكون أكبر من صفر"),
  isPrimary: z.boolean().default(false),
});

export type CreateProductSupplierFormData = z.infer<
  typeof createProductSupplierSchema
>;
export type UpdateProductSupplierFormData = z.infer<
  typeof updateProductSupplierSchema
>;
