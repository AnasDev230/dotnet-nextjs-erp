import { z } from "zod";

const supplierInvoiceFormSchemaBase = z.object({
  purchaseOrderId: z.string().min(1, "أمر الشراء مطلوب"),
  supplierId: z.string().min(1, "المورد مطلوب"),
  issueDate: z.string().min(1, "تاريخ الإصدار مطلوب"),
  dueDate: z.string().min(1, "تاريخ الاستحقاق مطلوب"),
  subtotal: z.coerce.number().min(0, "المبلغ قبل الضريبة لا يمكن أن يكون سالبًا"),
  taxAmount: z.coerce.number().min(0, "مبلغ الضريبة لا يمكن أن يكون سالبًا"),
  supplierReference: z
    .string()
    .max(100, "رقم فاتورة المورد يجب ألا يتجاوز 100 حرفًا")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(1000, "الملاحظات يجب ألا تتجاوز 1000 حرفًا")
    .optional()
    .or(z.literal("")),
});

export const supplierInvoiceFormSchema = supplierInvoiceFormSchemaBase.superRefine(
  (data, ctx) => {
    if (data.issueDate && data.dueDate) {
      const issueDate = new Date(`${data.issueDate}T00:00:00`);
      const dueDate = new Date(`${data.dueDate}T00:00:00`);
      if (dueDate < issueDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["dueDate"],
          message: "تاريخ الاستحقاق يجب أن يكون في تاريخ الإصدار أو بعده",
        });
      }
    }
  }
);

export type SupplierInvoiceFormData = z.infer<typeof supplierInvoiceFormSchema>;