import { z } from "zod";

export const createSupplierSchema = z.object({
  name: z
    .string()
    .min(1, "اسم المورد مطلوب")
    .max(255, "اسم المورد يجب ألا يتجاوز 255 حرفًا"),
  contactPerson: z
    .string()
    .max(100, "اسم جهة الاتصال يجب ألا يتجاوز 100 حرفًا")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("البريد الإلكتروني غير صالح")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .max(50, "رقم الهاتف يجب ألا يتجاوز 50 حرفًا")
    .optional()
    .or(z.literal("")),
  taxNumber: z
    .string()
    .max(50, "الرقم الضريبي يجب ألا يتجاوز 50 حرفًا")
    .optional()
    .or(z.literal("")),
  paymentTerms: z.coerce
    .number()
    .int("شروط الدفع يجب أن تكون عددًا صحيحًا")
    .min(0, "شروط الدفع يجب ألا تكون سالبة"),
  rating: z.coerce
    .number()
    .min(0, "التقييم يجب أن يكون بين 0 و 5")
    .max(5, "التقييم يجب أن يكون بين 0 و 5"),
});

export const updateSupplierSchema = z.object({
  name: z
    .string()
    .min(1, "اسم المورد مطلوب")
    .max(255, "اسم المورد يجب ألا يتجاوز 255 حرفًا"),
  contactPerson: z
    .string()
    .max(100, "اسم جهة الاتصال يجب ألا يتجاوز 100 حرفًا")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("البريد الإلكتروني غير صالح")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .max(50, "رقم الهاتف يجب ألا يتجاوز 50 حرفًا")
    .optional()
    .or(z.literal("")),
  taxNumber: z
    .string()
    .max(50, "الرقم الضريبي يجب ألا يتجاوز 50 حرفًا")
    .optional()
    .or(z.literal("")),
  paymentTerms: z.coerce
    .number()
    .int("شروط الدفع يجب أن تكون عددًا صحيحًا")
    .min(0, "شروط الدفع يجب ألا تكون سالبة"),
  rating: z.coerce
    .number()
    .min(0, "التقييم يجب أن يكون بين 0 و 5")
    .max(5, "التقييم يجب أن يكون بين 0 و 5"),
});

export type CreateSupplierFormData = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierFormData = z.infer<typeof updateSupplierSchema>;
