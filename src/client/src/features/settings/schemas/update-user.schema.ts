import { z } from "zod";

export const updateUserFormSchema = z.object({
  fullName: z
    .string()
    .min(1, "الاسم الكامل مطلوب")
    .max(200, "الاسم الكامل يجب ألا يتجاوز 200 حرفًا"),
  role: z.string().min(1, "الدور مطلوب"),
});

export type UpdateUserFormData = z.infer<typeof updateUserFormSchema>;