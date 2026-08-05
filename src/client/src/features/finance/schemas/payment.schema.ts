import { z } from "zod";

export const paymentMethodValues = [
  "Cash",
  "BankTransfer",
  "Card",
  "Cheque",
] as const;

export const createPaymentFormSchema = z.object({
  amount: z.coerce.number().positive("المبلغ يجب أن يكون أكبر من صفر"),
  paymentMethod: z.enum(paymentMethodValues, {
    message: "طريقة الدفع مطلوبة",
  }),
  paymentDate: z.string().min(1, "تاريخ الدفع مطلوب"),
  reference: z
    .string()
    .max(100, "المرجع يجب ألا يتجاوز 100 حرف")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(500, "الملاحظات يجب ألا تتجاوز 500 حرف")
    .optional()
    .or(z.literal("")),
});

/**
 * Extends the base payment schema with the remaining-amount check. The resolver
 * is re-created whenever the remaining amount (from the invoice) changes.
 */
export function createPaymentFormSchemaWithRemaining(
  getRemaining: () => number | undefined
) {
  return createPaymentFormSchema.superRefine((data, ctx) => {
    const remaining = getRemaining();
    if (remaining !== undefined && data.amount > remaining) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amount"],
        message: `المبلغ لا يمكن أن يتجاوز المبلغ المتبقي (${remaining.toLocaleString("ar-SA")})`,
      });
    }
  });
}

export type CreatePaymentFormData = z.infer<typeof createPaymentFormSchema>;
