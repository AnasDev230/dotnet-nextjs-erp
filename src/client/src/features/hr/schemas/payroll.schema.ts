import { z } from "zod";

export const createPayrollRunSchema = z.object({
  month: z.coerce
    .number()
    .int("الشهر غير صحيح")
    .min(1, "الشهر غير صحيح")
    .max(12, "الشهر غير صحيح"),
  year: z.coerce
    .number()
    .int("السنة غير صحيحة")
    .min(2000, "السنة غير صحيحة")
    .max(2100, "السنة غير صحيحة"),
  notes: z
    .string()
    .max(1000, "الملاحظات يجب ألا تتجاوز 1000 حرف")
    .optional()
    .or(z.literal("")),
});

export type CreatePayrollRunFormData = z.infer<typeof createPayrollRunSchema>;
