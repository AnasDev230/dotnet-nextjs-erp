import { z } from "zod";

export const companySettingsFormSchema = z.object({
  companyName: z
    .string()
    .min(1, "اسم الشركة مطلوب")
    .max(200, "اسم الشركة يجب ألا يتجاوز 200 حرفًا"),
  companyNameEn: z.string().optional().or(z.literal("")),
  taxNumber: z.string().optional().or(z.literal("")),
  phone: z
    .string()
    .max(50, "رقم الهاتف يجب ألا يتجاوز 50 حرفًا")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("صيغة البريد الإلكتروني غير صحيحة")
    .optional()
    .or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  currency: z
    .string()
    .min(1, "العملة مطلوبة")
    .max(10, "العملة يجب ألا تتجاوز 10 أحرف"),
});

export type CompanySettingsFormData = z.infer<typeof companySettingsFormSchema>;