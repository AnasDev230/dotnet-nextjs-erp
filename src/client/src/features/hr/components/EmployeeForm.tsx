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
import { useTranslation } from "@/hooks/use-translation";
import { EmployeeStatus, EmploymentType } from "@/types/hr";
import type { EmployeeDetail } from "@/types/hr";

interface EmployeeFormProps {
  mode: "create" | "edit";
  employee?: EmployeeDetail;
}

export default function EmployeeForm({ mode, employee }: EmployeeFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
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
      employmentType: employee?.employmentType ?? EmploymentType.FullTime,
      salary: employee?.salary ?? 0,
      managerId: employee?.managerId ?? "",
      notes: employee?.notes ?? "",
      status: employee?.status ?? EmployeeStatus.Active,
    },
  });

  const departmentOptions = [
    { value: "", label: t("hr.employees.withoutDepartment") },
    ...(allDepartments ?? []).map((d) => ({
      value: d.id,
      label: `${d.code} — ${d.name}`,
    })),
  ];

  const managerOptions = [
    { value: "", label: t("hr.employees.withoutManager") },
    ...(allEmployees ?? [])
      .filter((e) => e.id !== employee?.id)
      .map((e) => ({
        value: e.id,
        label: e.fullName,
      })),
  ];

  const employmentTypeOptions = [
    { value: EmploymentType.FullTime, label: t("hr.employees.fullTime") },
    { value: EmploymentType.PartTime, label: t("hr.employees.partTime") },
    { value: EmploymentType.Contract, label: t("hr.employees.contract") },
    { value: EmploymentType.Intern, label: t("hr.employees.intern") },
  ];

  const statusOptions = [
    { value: EmployeeStatus.Active, label: t("hr.employees.active") },
    { value: EmployeeStatus.OnLeave, label: t("hr.employees.onLeave") },
    { value: EmployeeStatus.Terminated, label: t("hr.employees.terminated") },
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
          status: data.status ?? EmployeeStatus.Active,
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
          {isEdit ? t("hr.employees.editTitle") : t("hr.employees.newTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <p>{t("common.error")}: {(error as any)?.response?.data?.message || error.message}</p>
          </Alert>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">{t("hr.employees.firstNameRequired")}</Label>
              <Input
                id="firstName"
                {...form.register("firstName")}
                placeholder={t("hr.employees.enterFirstName")}
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
              <Label htmlFor="lastName">{t("hr.employees.lastNameRequired")}</Label>
              <Input
                id="lastName"
                {...form.register("lastName")}
                placeholder={t("hr.employees.enterLastName")}
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
              <Label htmlFor="email">{t("common.email")}</Label>
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
              <Label htmlFor="phone">{t("common.phone")}</Label>
              <Input
                id="phone"
                {...form.register("phone")}
                placeholder="+966 5x xxx xxxx"
                className="h-10"
              />
            </div>

            {/* Hire Date */}
            <div className="space-y-2">
              <Label htmlFor="hireDate">{t("hr.employees.hireDateRequired")}</Label>
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
              <Label htmlFor="jobTitle">{t("hr.employees.jobTitle")}</Label>
              <Input
                id="jobTitle"
                {...form.register("jobTitle")}
                placeholder={t("hr.employees.enterJobTitle")}
                className="h-10"
              />
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="departmentId">{t("hr.employees.department")}</Label>
              <Select
                id="departmentId"
                {...form.register("departmentId")}
                options={departmentOptions}
                placeholder={t("hr.employees.selectDepartment")}
                className="h-10"
              />
            </div>

            {/* Employment Type */}
            <div className="space-y-2">
              <Label htmlFor="employmentType">{t("hr.employees.employmentTypeLabel")}</Label>
              <Select
                id="employmentType"
                {...form.register("employmentType")}
                options={employmentTypeOptions}
                placeholder={t("hr.employees.selectEmploymentType")}
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
              <Label htmlFor="salary">{t("hr.employees.salaryRequired")}</Label>
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
              <Label htmlFor="managerId">{t("hr.employees.manager")}</Label>
              <Select
                id="managerId"
                {...form.register("managerId")}
                options={managerOptions}
                placeholder={t("hr.employees.selectManager")}
                className="h-10"
              />
            </div>

            {/* Status — edit only */}
            {isEdit && (
              <div className="space-y-2">
                <Label htmlFor="status">{t("hr.employees.statusLabel")}</Label>
                <Select
                  id="status"
                  {...form.register("status")}
                  options={statusOptions}
                  placeholder={t("hr.employees.selectStatus")}
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
            <Label htmlFor="notes">{t("hr.employees.notesLabel")}</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder={t("hr.employees.notesPlaceholder")}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? t("hr.employees.saveChanges") : t("hr.employees.addNew")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/hr/employees")}
            >
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
