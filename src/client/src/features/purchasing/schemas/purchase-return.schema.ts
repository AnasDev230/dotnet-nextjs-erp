import { z } from "zod";

export const purchaseReturnItemSchema = z.object({
  key: z.string().optional(),
  productId: z.string().min(1, "المنتج مطلوب"),
  productName: z.string().optional(),
  productSku: z.string().optional(),
  quantity: z.coerce
    .number()
    .positive("الكمية المرتجعة يجب أن تكون أكبر من صفر"),
  unitCost: z.coerce
    .number()
    .min(0, "تكلفة الوحدة يجب أن تكون 0 أو أكثر"),
  maxQuantity: z.coerce.number().optional(),
  reason: z.string().optional().or(z.literal("")),
});

export const purchaseReturnFormSchema = z
  .object({
    goodsReceiptId: z.string().min(1, "الاستلام مطلوب"),
    supplierId: z.string().min(1, "المورد مطلوب"),
    warehouseId: z.string().min(1, "المستودع مطلوب"),
    returnDate: z.string().min(1, "تاريخ المرتجع مطلوب"),
    reason: z
      .string()
      .max(500, "سبب الإرجاع يجب ألا يتجاوز 500 حرفًا")
      .optional()
      .or(z.literal("")),
    items: z
      .array(purchaseReturnItemSchema)
      .min(1, "يجب إضافة صنف مرتجع واحد على الأقل"),
  })
  .superRefine((data, ctx) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (data.returnDate) {
      const returnDate = new Date(`${data.returnDate}T00:00:00`);
      if (returnDate > today) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["returnDate"],
          message: "لا يمكن أن يكون تاريخ المرتجع في المستقبل",
        });
      }
    }

    const seen = new Set<string>();
    data.items.forEach((item, index) => {
      if (!item.productId) return;

      if (seen.has(item.productId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["items", index, "productId"],
          message: "لا يمكن تكرار نفس المنتج في نفس المرتجع",
        });
      }
      seen.add(item.productId);

      if (item.maxQuantity !== undefined && item.quantity > item.maxQuantity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["items", index, "quantity"],
          message: "الكمية المرتجعة أكبر من الكمية الأصلية",
        });
      }
    });
  });

export type PurchaseReturnItemFormData = z.infer<
  typeof purchaseReturnItemSchema
>;
export type PurchaseReturnFormData = z.infer<typeof purchaseReturnFormSchema>;