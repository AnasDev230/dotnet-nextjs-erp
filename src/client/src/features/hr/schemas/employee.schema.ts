import { z } from "zod";
import { EmployeeStatus, EmploymentType } from "@/types/hr";

export const createEmployeeSchema = z.object({
  firstName: z
    .string()
    .min(1, "الاسم الأول مطلوب")
    .max(100, "الاسم الأول يجب ألا يتجاوز 100 حرفًا"),
  lastName: z
    .string()
    .min(1, "اسم العائلة مطلوب")
    .max(100, "اسم العائلة يجب ألا يتجاوز 100 حرفًا"),
  email: z
    .string()
    .email("بريد إلكتروني غير صالح")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  hireDate: z.string().min(1, "تاريخ التعيين مطلوب"),
  departmentId: z.string().optional().or(z.literal("")),
  jobTitle: z.string().optional().or(z.literal("")),
  employmentType: z.nativeEnum(EmploymentType),
  salary: z.number().min(0, "الراتب يجب أن يكون 0 أو أكثر"),
  managerId: z.string().optional().or(z.literal("")),
  userId: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export const updateEmployeeSchema = z.object({
  firstName: z
    .string()
    .min(1, "الاسم الأول مطلوب")
    .max(100, "الاسم الأول يجب ألا يتجاوز 100 حرفًا"),
  lastName: z
    .string()
    .min(1, "اسم العائلة مطلوب")
    .max(100, "اسم العائلة يجب ألا يتجاوز 100 حرفًا"),
  email: z
    .string()
    .email("بريد إلكتروني غير صالح")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  hireDate: z.string().min(1, "تاريخ التعيين مطلوب"),
  departmentId: z.string().optional().or(z.literal("")),
  jobTitle: z.string().optional().or(z.literal("")),
  employmentType: z.nativeEnum(EmploymentType),
  salary: z.number().min(0, "الراتب يجب أن يكون 0 أو أكثر"),
  managerId: z.string().optional().or(z.literal("")),
  userId: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  status: z.nativeEnum(EmployeeStatus),
});

export const employeeFormSchema = z.object({
  firstName: z
    .string()
    .min(1, "الاسم الأول مطلوب")
    .max(100, "الاسم الأول يجب ألا يتجاوز 100 حرفًا"),
  lastName: z
    .string()
    .min(1, "اسم العائلة مطلوب")
    .max(100, "اسم العائلة يجب ألا يتجاوز 100 حرفًا"),
  email: z
    .string()
    .email("بريد إلكتروني غير صالح")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  hireDate: z.string().min(1, "تاريخ التعيين مطلوب"),
  departmentId: z.string().optional().or(z.literal("")),
  jobTitle: z.string().optional().or(z.literal("")),
  employmentType: z.nativeEnum(EmploymentType),
  salary: z.number().min(0, "الراتب يجب أن يكون 0 أو أكثر"),
  managerId: z.string().optional().or(z.literal("")),
  userId: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  status: z.nativeEnum(EmployeeStatus).optional(),
});

export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeFormData = z.infer<typeof updateEmployeeSchema>;
export type EmployeeFormData = z.infer<typeof employeeFormSchema>;
