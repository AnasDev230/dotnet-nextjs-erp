import { z } from "zod";

export const grnItemSchema = z.object({
  key: z.string().optional(),
  poItemId: z.string().min(1, "سطر أمر الشراء مطلوب"),
  productId: z.string().min(1, "المنتج مطلوب"),
  quantity: z.coerce.number().positive("الكمية يجب أن تكون أكبر من صفر"),
});

const goodsReceiptFormSchemaBase = z.object({
  purchaseOrderId: z.string().min(1, "أمر الشراء مطلوب"),
  receiptDate: z.string().min(1, "تاريخ الاستلام مطلوب"),
  warehouseId: z.string().min(1, "المستودع مطلوب"),
  notes: z
    .string()
    .max(1000, "الملاحظات يجب ألا تتجاوز 1000 حرفًا")
    .optional()
    .or(z.literal("")),
  items: z.array(grnItemSchema).min(1, "يجب إضافة عنصر استلام واحد على الأقل"),
});

export const goodsReceiptFormSchema = goodsReceiptFormSchemaBase.superRefine(
  (data, ctx) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (data.receiptDate) {
      const receiptDate = new Date(`${data.receiptDate}T00:00:00`);
      if (receiptDate > today) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["receiptDate"],
          message: "لا يمكن أن يكون تاريخ الاستلام في المستقبل",
        });
      }
    }

    const poItemIds = data.items
      .map((item) => item.poItemId)
      .filter((id) => id);
    if (new Set(poItemIds).size !== poItemIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items"],
        message: "لا يمكن تكرار نفس سطر أمر الشراء في نفس الاستلام",
      });
    }
  }
);

export type GrnItemFormData = z.infer<typeof grnItemSchema>;
export type GoodsReceiptFormData = z.infer<typeof goodsReceiptFormSchema>;
