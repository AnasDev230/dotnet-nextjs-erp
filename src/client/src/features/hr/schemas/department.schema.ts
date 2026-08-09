import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z
    .string()
    .min(1, "اسم القسم مطلوب")
    .max(200, "اسم القسم يجب ألا يتجاوز 200 حرفًا"),
  parentId: z.string().optional().or(z.literal("")),
  managerId: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
});

export const updateDepartmentSchema = z.object({
  name: z
    .string()
    .min(1, "اسم القسم مطلوب")
    .max(200, "اسم القسم يجب ألا يتجاوز 200 حرفًا"),
  parentId: z.string().optional().or(z.literal("")),
  managerId: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  isActive: z.boolean(),
});

export const departmentFormSchema = z.object({
  name: z
    .string()
    .min(1, "اسم القسم مطلوب")
    .max(200, "اسم القسم يجب ألا يتجاوز 200 حرفًا"),
  parentId: z.string().optional().or(z.literal("")),
  managerId: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export type CreateDepartmentFormData = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentFormData = z.infer<typeof updateDepartmentSchema>;
export type DepartmentFormData = z.infer<typeof departmentFormSchema>;
