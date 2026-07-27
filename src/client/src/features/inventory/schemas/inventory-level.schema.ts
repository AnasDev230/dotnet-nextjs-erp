import { z } from "zod";

export const upsertInventoryLevelSchema = z.object({
  productId: z.string().min(1, "المنتج مطلوب"),
  warehouseId: z.string().min(1, "المستودع مطلوب"),
  quantityOnHand: z.coerce.number().min(0, "الكمية يجب أن تكون 0 أو أكثر"),
  avgCost: z.coerce.number().min(0, "التكلفة يجب أن تكون 0 أو أكثر"),
});

export type UpsertInventoryLevelFormData = z.infer<typeof upsertInventoryLevelSchema>;
