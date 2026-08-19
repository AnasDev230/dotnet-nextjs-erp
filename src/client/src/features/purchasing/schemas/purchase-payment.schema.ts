import { z } from "zod";

export const purchasePaymentMethodOptions = [
  { value: "Cash", label: "نقدي" },
  { value: "BankTransfer", label: "تحويل بنكي" },
  { value: "Card", label: "بطاقة" },
  { value: "Cheque", label: "شيك" },
] as const;

export const purchasePaymentFormSchema = z.object({
  amount: z.coerce
    .number()
    .positive("يجب أن يكون مبلغ الدفعة أكبر من صفر"),
  method: z.string().min(1, "طريقة الدفع مطلوبة"),
  paymentDate: z.string().min(1, "تاريخ الدفع مطلوب"),
  reference: z
    .string()
    .max(100, "المرجع يجب ألا يتجاوز 100 حرفًا")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(500, "الملاحظات يجب ألا تتجاوز 500 حرفًا")
    .optional()
    .or(z.literal("")),
});

export function createPurchasePaymentSchema(maxAmount: number) {
  return purchasePaymentFormSchema.superRefine((data, ctx) => {
    if (data.amount > maxAmount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amount"],
        message: `لا يمكن أن تتجاوز الدفعة المبلغ المتبقي (${maxAmount.toLocaleString()})`,
      });
    }
  });
}

export type PurchasePaymentFormData = z.infer<typeof purchasePaymentFormSchema>;