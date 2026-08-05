import { z } from "zod";

export const createInvoiceSchema = z.object({
  orderId: z.string().uuid("أمر البيع مطلوب"),
  issueDate: z.string().min(1, "تاريخ الإصدار مطلوب"),
});

export type CreateInvoiceFormData = z.infer<typeof createInvoiceSchema>;
