import { z } from "zod";

export const createUserFormSchema = z
  .object({
    userName: z
      .string()
      .min(3, "اسم المستخدم يجب ألا يقل عن 3 أحرف")
      .max(100, "اسم المستخدم يجب ألا يتجاوز 100 حرفًا"),
    email: z
      .string()
      .email("صيغة البريد الإلكتروني غير صحيحة")
      .max(200, "البريد الإلكتروني يجب ألا يتجاوز 200 حرفًا"),
    password: z
      .string()
      .min(8, "كلمة المرور يجب ألا تقل عن 8 أحرف")
      .regex(/[A-Z]/, "كلمة المرور يجب أن تحتوي على حرف كبير")
      .regex(/[a-z]/, "كلمة المرور يجب أن تحتوي على حرف صغير")
      .regex(/[0-9]/, "كلمة المرور يجب أن تحتوي على رقم"),
    confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
    fullName: z
      .string()
      .min(1, "الاسم الكامل مطلوب")
      .max(200, "الاسم الكامل يجب ألا يتجاوز 200 حرفًا"),
    role: z.string().min(1, "الدور مطلوب"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export type CreateUserFormData = z.infer<typeof createUserFormSchema>;