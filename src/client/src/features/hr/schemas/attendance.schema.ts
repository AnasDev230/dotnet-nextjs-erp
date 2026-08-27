import { z } from "zod";

export const createAttendanceSchema = z
  .object({
    employeeId: z.string().min(1, "الموظف مطلوب"),
    date: z.string().min(1, "التاريخ مطلوب"),
    checkIn: z.string().optional().or(z.literal("")),
    checkOut: z.string().optional().or(z.literal("")),
    breakMinutes: z.coerce
      .number()
      .int("دقائق الاستراحة يجب أن تكون رقماً صحيحاً")
      .min(0, "دقائق الاستراحة يجب أن تكون 0 أو أكثر")
      .max(480, "دقائق الاستراحة كبيرة جداً"),
    status: z.string().min(1, "الحالة مطلوبة"),
    notes: z
      .string()
      .max(500, "الملاحظات يجب ألا تتجاوز 500 حرف")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => !data.checkIn || !data.checkOut || data.checkOut > data.checkIn,
    {
      message: "وقت الخروج يجب أن يكون بعد وقت الدخول",
      path: ["checkOut"],
    }
  );

export type CreateAttendanceFormData = z.infer<typeof createAttendanceSchema>;
