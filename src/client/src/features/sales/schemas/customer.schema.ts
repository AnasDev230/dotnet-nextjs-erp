import { z } from "zod";

export const customerTypeValues = ["Individual", "Company"] as const;
export const customerStatusValues = ["Active", "Suspended"] as const;

export const createCustomerSchema = z.object({
  code: z
    .string()
    .min(1, "رمز العميل مطلوب")
    .max(50, "الرمز يجب ألا يتجاوز 50 حرفًا"),
  name: z
    .string()
    .min(1, "اسم العميل مطلوب")
    .max(255, "الاسم يجب ألا يتجاوز 255 حرفًا"),
  type: z.enum(customerTypeValues, { message: "نوع العميل غير صحيح" }),
  taxNumber: z
    .string()
    .max(50, "الرقم الضريبي يجب ألا يتجاوز 50 حرفًا")
    .optional()
    .or(z.literal("")),
  creditLimit: z.number().min(0, "حد الائتمان يجب أن يكون 0 أو أكثر"),
  paymentTerms: z.number().min(0, "شروط الدفع يجب أن تكون 0 أو أكثر"),
});

export const updateCustomerSchema = z.object({
  name: z
    .string()
    .min(1, "اسم العميل مطلوب")
    .max(255, "الاسم يجب ألا يتجاوز 255 حرفًا"),
  type: z.enum(customerTypeValues, { message: "نوع العميل غير صحيح" }),
  taxNumber: z
    .string()
    .max(50, "الرقم الضريبي يجب ألا يتجاوز 50 حرفًا")
    .optional()
    .or(z.literal("")),
  creditLimit: z.number().min(0, "حد الائتمان يجب أن يكون 0 أو أكثر"),
  paymentTerms: z.number().min(0, "شروط الدفع يجب أن تكون 0 أو أكثر"),
  status: z.enum(customerStatusValues, { message: "حالة العميل غير صحيحة" }),
});

export const customerFormSchema = z.object({
  code: z.string().optional().or(z.literal("")),
  name: z
    .string()
    .min(1, "اسم العميل مطلوب")
    .max(255, "الاسم يجب ألا يتجاوز 255 حرفًا"),
  type: z.enum(customerTypeValues, { message: "نوع العميل غير صحيح" }),
  taxNumber: z
    .string()
    .max(50, "الرقم الضريبي يجب ألا يتجاوز 50 حرفًا")
    .optional()
    .or(z.literal("")),
  creditLimit: z.number().min(0, "حد الائتمان يجب أن يكون 0 أو أكثر").optional(),
  paymentTerms: z
    .number()
    .min(0, "شروط الدفع يجب أن تكون 0 أو أكثر")
    .optional(),
  status: z
    .enum(customerStatusValues, { message: "حالة العميل غير صحيحة" })
    .optional(),
});

export type CreateCustomerFormData = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerFormData = z.infer<typeof updateCustomerSchema>;
export type CustomerFormData = z.infer<typeof customerFormSchema>;
