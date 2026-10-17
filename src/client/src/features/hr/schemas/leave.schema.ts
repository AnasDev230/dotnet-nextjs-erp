import { z } from "zod";

export const leaveFormSchema = z
  .object({
    employeeId: z.string().min(1, "الموظف مطلوب"),
    leaveType: z.string().min(1, "نوع الإجازة مطلوب"),
    startDate: z.string().min(1, "تاريخ البداية مطلوب"),
    endDate: z.string().min(1, "تاريخ النهاية مطلوب"),
    reason: z
      .string()
      .min(1, "سبب الإجازة مطلوب")
      .max(500, "سبب الإجازة يجب ألا يتجاوز 500 حرف"),
  })
  .refine(
    (data) => !data.startDate || !data.endDate || data.endDate >= data.startDate,
    {
      message: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية أو مساوياً له",
      path: ["endDate"],
    }
  );

export const rejectLeaveSchema = z.object({
  decisionNote: z
    .string()
    .min(1, "سبب الرفض مطلوب")
    .max(500, "سبب الرفض يجب ألا يتجاوز 500 حرف"),
});

export const cancelLeaveSchema = z.object({
  decisionNote: z
    .string()
    .max(500, "الملاحظة يجب ألا تتجاوز 500 حرف")
    .optional()
    .or(z.literal("")),
});

export type LeaveFormData = z.infer<typeof leaveFormSchema>;
export type RejectLeaveFormData = z.infer<typeof rejectLeaveSchema>;
export type CancelLeaveFormData = z.infer<typeof cancelLeaveSchema>;
