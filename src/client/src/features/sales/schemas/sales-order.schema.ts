import { z } from "zod";

export const salesOrderStatusValues = ["Draft", "Confirmed", "Cancelled"] as const;

export const salesOrderItemSchema = z.object({
  key: z.string().optional(),
  productId: z.string().min(1, "المنتج مطلوب"),
  quantity: z.coerce.number().positive("الكمية يجب أن تكون أكبر من صفر"),
  unitPrice: z.coerce.number().min(0, "سعر الوحدة يجب أن يكون 0 أو أكثر"),
  discountPct: z.coerce
    .number()
    .min(0, "نسبة خصم السطر يجب أن تكون بين 0 و 100")
    .max(100, "نسبة خصم السطر يجب أن تكون بين 0 و 100")
    .default(0),
});

const salesOrderFormSchemaBase = z
  .object({
    customerId: z.string().min(1, "العميل مطلوب"),
    warehouseId: z.string().min(1, "المستودع مطلوب"),
    orderDate: z.string().min(1, "تاريخ الأمر مطلوب"),
    deliveryDate: z.string().optional().or(z.literal("")),
    notes: z
      .string()
      .max(2000, "الملاحظات يجب ألا تتجاوز 2000 حرفًا")
      .optional()
      .or(z.literal("")),
    status: z
      .enum(salesOrderStatusValues, { message: "حالة الأمر غير صحيحة" })
      .optional(),
    discountPct: z.coerce
      .number()
      .min(0, "نسبة الخصم يجب أن تكون بين 0 و 100")
      .max(100, "نسبة الخصم يجب أن تكون بين 0 و 100")
      .default(0),
    taxRateId: z.string().optional().or(z.literal("")),
    items: z.array(salesOrderItemSchema).min(1, "يجب إضافة منتج واحد على الأقل"),
  })
  .superRefine((data, ctx) => {
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

    if (data.deliveryDate && data.orderDate) {
      const orderDate = new Date(`${data.orderDate}T00:00:00`);
      const deliveryDate = new Date(`${data.deliveryDate}T00:00:00`);
      if (deliveryDate < orderDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["deliveryDate"],
          message: "تاريخ التسليم يجب أن يكون في نفس تاريخ الأمر أو بعده",
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
  });

/**
 * Factory that extends the base schema with stock validation against the
 * selected warehouse. The resolver is re-created by the form whenever the
 * warehouse (and therefore the available-stock map) changes.
 */
export function createSalesOrderFormSchema(
  getAvailableStock: (productId: string) => number | undefined
) {
  return salesOrderFormSchemaBase.superRefine((data, ctx) => {
    data.items.forEach((item, index) => {
      if (!item.productId) return;
      const available = getAvailableStock(item.productId);
      if (available === undefined) return;
      if (item.quantity > available) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["items", index, "quantity"],
          message: `الكمية المطلوبة أكبر من المتاح في المستودع (المتاح: ${available})`,
        });
      }
    });
  });
}

export const salesOrderFormSchema = createSalesOrderFormSchema(() => undefined);

export type SalesOrderItemFormData = z.infer<typeof salesOrderItemSchema>;
export type SalesOrderFormData = z.infer<typeof salesOrderFormSchema>;
