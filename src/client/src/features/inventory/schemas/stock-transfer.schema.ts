import { z } from "zod";

export const createStockTransferSchema = z
  .object({
    fromWarehouseId: z.string().min(1, "المستودع المصدر مطلوب"),
    toWarehouseId: z.string().min(1, "المستودع الوجهة مطلوب"),
    productId: z.string().min(1, "المنتج مطلوب"),
    quantity: z.coerce
      .number()
      .positive("الكمية يجب أن تكون أكبر من صفر"),
    notes: z
      .string()
      .max(1000, "الملاحظات طويلة جداً (1000 حرف كحد أقصى)")
      .optional(),
  })
  .refine((data) => data.fromWarehouseId !== data.toWarehouseId, {
    message: "لا يمكن أن يكون المستودع المصدر والوجهة متطابقين",
    path: ["toWarehouseId"],
  });

export type CreateStockTransferFormData = z.infer<typeof createStockTransferSchema>;