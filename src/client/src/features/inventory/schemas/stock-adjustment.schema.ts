import { z } from "zod";

export const createStockAdjustmentSchema = z.object({
  productId: z.string().min(1, "المنتج مطلوب"),
  warehouseId: z.string().min(1, "المستودع مطلوب"),
  countedQty: z.coerce.number().min(0, "الكمية يجب أن تكون 0 أو أكثر"),
  reason: z
    .string()
    .min(5, "يرجى إدخال سبب التسوية (5 أحرف على الأقل)")
    .max(500, "السبب طويل جداً"),
});

export type CreateStockAdjustmentFormData = z.infer<typeof createStockAdjustmentSchema>;
