import { z } from "zod";

export const purchaseOrderStatusOptions = [
  { value: "Draft", label: "مسودة" },
  { value: "Submitted", label: "مقدمة" },
  { value: "Approved", label: "معتمدة" },
  { value: "PartiallyReceived", label: "استلام جزئي" },
  { value: "Received", label: "مستلمة بالكامل" },
  { value: "Cancelled", label: "ملغاة" },
] as const;

export const poItemSchema = z.object({
  key: z.string().optional(),
  productId: z.string().min(1, "المنتج مطلوب"),
  quantity: z.coerce.number().positive("الكمية يجب أن تكون أكبر من صفر"),
  unitPrice: z.coerce
    .number()
    .positive("سعر الوحدة يجب أن يكون أكبر من صفر"),
});

const purchaseOrderFormSchemaBase = z.object({
  supplierId: z.string().min(1, "المورد مطلوب"),
  orderDate: z.string().min(1, "تاريخ الأمر مطلوب"),
  expectedDate: z.string().optional().or(z.literal("")),
  currency: z
    .string()
    .min(1, "العملة مطلوبة")
    .max(10, "رمز العملة يجب ألا يتجاوز 10 أحرف")
    .default("SAR"),
  terms: z
    .string()
    .max(1000, "الشروط يجب ألا تتجاوز 1000 حرفًا")
    .optional()
    .or(z.literal("")),
  items: z.array(poItemSchema).min(1, "يجب إضافة منتج واحد على الأقل"),
});

export const purchaseOrderFormSchema = purchaseOrderFormSchemaBase.superRefine(
  (data, ctx) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (data.orderDate) {
      const orderDate = new Date(`${data.orderDate}T00:00:00`);
      if (orderDate > today) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["orderDate"],
          message: "لا يمكن أن يكون تاريخ الأمر في المستقبل",
        });
      }
    }

    if (data.expectedDate && data.orderDate) {
      const orderDate = new Date(`${data.orderDate}T00:00:00`);
      const expectedDate = new Date(`${data.expectedDate}T00:00:00`);
      if (expectedDate < orderDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["expectedDate"],
          message: "تاريخ التوقع يجب أن يكون في نفس تاريخ الأمر أو بعده",
        });
      }
    }

    const productIds = data.items
      .map((item) => item.productId)
      .filter((id) => id);
    if (new Set(productIds).size !== productIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items"],
        message: "لا يمكن تكرار نفس المنتج في نفس الأمر",
      });
    }
  }
);

export type PoItemFormData = z.infer<typeof poItemSchema>;
export type PurchaseOrderFormData = z.infer<typeof purchaseOrderFormSchema>;
