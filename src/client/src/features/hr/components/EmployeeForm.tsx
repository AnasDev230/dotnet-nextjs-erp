"use client";

import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Input,
  Textarea,
  Select,
  Button,
  Alert,
} from "@/components/ui";
import {
  employeeFormSchema,
  type EmployeeFormData,
} from "../schemas/employee.schema";
import { useCreateEmployee } from "../hooks/useCreateEmployee";
import { useUpdateEmployee } from "../hooks/useUpdateEmployee";
import { useDepartmentsForDropdown } from "../hooks/useDepartmentsForDropdown";
import { useEmployeesForDropdown } from "../hooks/useEmployeesForDropdown";
import type { EmployeeDetail } from "@/types/hr";

const employmentTypeOptions = [
  { value: "0", label: "دوام كامل" },
  { value: "1", label: "دوام جزئي" },
  { value: "2", label: "عقد" },
  { value: "3", label: "تدريب" },
];

const statusOptions = [
  { value: "0", label: "نشط" },
  { value: "1", label: "في إجازة" },
  { value: "2", label: "مفصول" },
];

interface EmployeeFormProps {
  mode: "create" | "edit";
  employee?: EmployeeDetail;
}

export default function EmployeeForm({ mode, employee }: EmployeeFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee(employee?.id ?? "");
  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  const { data: allDepartments } = useDepartmentsForDropdown();
  const { data: allEmployees } = useEmployeesForDropdown();

  const zodResolverTyped = zodResolver(employeeFormSchema) as Resolver<EmployeeFormData>;

  const form = useForm<EmployeeFormData>({
    resolver: zodResolverTyped,
    defaultValues: {
      firstName: employee?.firstName ?? "",
      lastName: employee?.lastName ?? "",
      email: employee?.email ?? "",
      phone: employee?.phone ?? "",
      hireDate: employee?.hireDate ?? "",
      departmentId: employee?.departmentId ?? "",
      jobTitle: employee?.jobTitle ?? "",
      employmentType: employee?.employmentType ?? 0,
      salary: employee?.salary ?? 0,
      managerId: employee?.managerId ?? "",
      notes: employee?.notes ?? "",
      status: employee?.status ?? 0,
    },
  });

  const departmentOptions = [
    { value: "", label: "بدون قسم" },
    ...(allDepartments ?? []).map((d) => ({
      value: d.id,
      label: `${d.code} — ${d.name}`,
    })),
  ];

  const managerOptions = [
    { value: "", label: "بدون مدير" },
    ...(allEmployees ?? [])
      .filter((e) => e.id !== employee?.id)
      .map((e) => ({
        value: e.id,
        label: e.fullName,
      })),
  ];

  const onSubmit = async (data: EmployeeFormData) => {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || undefined,
      phone: data.phone || undefined,
      hireDate: data.hireDate,
      departmentId: data.departmentId || undefined,
      jobTitle: data.jobTitle || undefined,
      employmentType: data.employmentType,
      salary: data.salary,
      managerId: data.managerId || undefined,
      notes: data.notes || undefined,
    };

    try {
      if (isEdit && employee) {
        await updateMutation.mutateAsync({
          ...payload,
          status: data.status ?? 0,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      router.push("/hr/employees");
    } catch {
      // Error handled via mutation state
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {isEdit ? "تعديل الموظف" : "إضافة موظف جديد"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <p>حدث خطأ: {(error as any)?.response?.data?.message || error.message}</p>
          </Alert>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">الاسم الأول *</Label>
              <Input
                id="firstName"
                {...form.register("firstName")}
                placeholder="أدخل الاسم الأول"
                className="h-10"
              />
              {form.formState.errors.firstName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">اسم العائلة *</Label>
              <Input
                id="lastName"
                {...form.register("lastName")}
                placeholder="أدخل اسم العائلة"
                className="h-10"
              />
              {form.formState.errors.lastName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="example@company.com"
                className="h-10"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                {...form.register("phone")}
                placeholder="+966 5x xxx xxxx"
                className="h-10"
              />
            </div>

            {/* Hire Date */}
            <div className="space-y-2">
              <Label htmlFor="hireDate">تاريخ التعيين *</Label>
              <Input
                id="hireDate"
                type="date"
                {...form.register("hireDate")}
                className="h-10"
              />
              {form.formState.errors.hireDate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.hireDate.message}
                </p>
              )}
            </div>

            {/* Job Title */}
            <div className="space-y-2">
              <Label htmlFor="jobTitle">المسمى الوظيفي</Label>
              <Input
                id="jobTitle"
                {...form.register("jobTitle")}
                placeholder="مثال: مهندس برمجيات"
                className="h-10"
              />
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="departmentId">القسم</Label>
              <Select
                id="departmentId"
                {...form.register("departmentId")}
                options={departmentOptions}
                placeholder="اختر القسم"
                className="h-10"
              />
            </div>

            {/* Employment Type */}
            <div className="space-y-2">
              <Label htmlFor="employmentType">نوع التوظيف *</Label>
              <Select
                id="employmentType"
                {...form.register("employmentType", { valueAsNumber: true })}
                options={employmentTypeOptions}
                placeholder="اختر نوع التوظيف"
                className="h-10"
              />
              {form.formState.errors.employmentType && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.employmentType.message}
                </p>
              )}
            </div>

            {/* Salary */}
            <div className="space-y-2">
              <Label htmlFor="salary">الراتب *</Label>
              <Input
                id="salary"
                type="number"
                step="0.01"
                min="0"
                {...form.register("salary", { valueAsNumber: true })}
                placeholder="0.00"
                className="h-10"
              />
              {form.formState.errors.salary && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.salary.message}
                </p>
              )}
            </div>

            {/* Manager */}
            <div className="space-y-2">
              <Label htmlFor="managerId">المدير المباشر</Label>
              <Select
                id="managerId"
                {...form.register("managerId")}
                options={managerOptions}
                placeholder="اختر المدير المباشر"
                className="h-10"
              />
            </div>

            {/* Status — edit only */}
            {isEdit && (
              <div className="space-y-2">
                <Label htmlFor="status">الحالة *</Label>
                <Select
                  id="status"
                  {...form.register("status", { valueAsNumber: true })}
                  options={statusOptions}
                  placeholder="اختر الحالة"
                  className="h-10"
                />
                {form.formState.errors.status && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.status.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder="ملاحظات إضافية (اختياري)"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {isEdit ? "حفظ التغييرات" : "إضافة الموظف"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/hr/employees")}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
