import { z } from "zod";

export const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "كلمة المرور الحالية مطلوبة"),
    newPassword: z
      .string()
      .min(8, "كلمة المرور يجب ألا تقل عن 8 أحرف")
      .regex(/[A-Z]/, "كلمة المرور يجب أن تحتوي على حرف كبير")
      .regex(/[a-z]/, "كلمة المرور يجب أن تحتوي على حرف صغير")
      .regex(/[0-9]/, "كلمة المرور يجب أن تحتوي على رقم"),
    confirmNewPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "كلمة المرور الجديدة يجب أن تختلف عن الحالية",
    path: ["newPassword"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordFormSchema>;