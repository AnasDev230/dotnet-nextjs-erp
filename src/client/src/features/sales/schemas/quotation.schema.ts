import { z } from "zod";

const quotationItemSchema = z.object({
  productId: z.string().min(1, "المنتج مطلوب"),
  quantity: z.number().positive("الكمية يجب أن تكون أكبر من صفر"),
  unitPrice: z.number().positive("سعر الوحدة يجب أن يكون أكبر من صفر"),
  discountPercent: z
    .number()
    .min(0, "نسبة الخصم يجب أن تكون بين 0 و 100")
    .max(100, "نسبة الخصم يجب أن تكون بين 0 و 100"),
});

export const quotationFormSchema = z
  .object({
    customerId: z.string().min(1, "العميل مطلوب"),
    quotationDate: z.string().min(1, "تاريخ العرض مطلوب"),
    expiryDate: z.string().min(1, "تاريخ الانتهاء مطلوب"),
    discountAmount: z.number().min(0, "الخصم يجب أن يكون 0 أو أكثر"),
    taxAmount: z.number().min(0, "الضريبة يجب أن تكون 0 أو أكثر"),
    notes: z.string().max(2000, "الملاحظات يجب ألا تتجاوز 2000 حرفاً").optional(),
    items: z.array(quotationItemSchema).min(1, "يجب إضافة صنف واحد على الأقل"),
  })
  .refine(
    (data) => new Date(data.expiryDate) > new Date(data.quotationDate),
    {
      message: "تاريخ الانتهاء يجب أن يكون بعد تاريخ العرض",
      path: ["expiryDate"],
    }
  );

export type QuotationFormData = z.infer<typeof quotationFormSchema>;
