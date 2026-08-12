"use client";

import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Building2 } from "lucide-react";
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
  departmentFormSchema,
  type DepartmentFormData,
} from "../schemas/department.schema";
import { useCreateDepartment } from "../hooks/useCreateDepartment";
import { useUpdateDepartment } from "../hooks/useUpdateDepartment";
import { useDepartmentsForDropdown } from "../hooks/useDepartmentsForDropdown";
import { useEmployeesForDropdown } from "../hooks/useEmployeesForDropdown";
import { useTranslation } from "@/hooks/use-translation";
import type { DepartmentDetail } from "@/types/hr";

interface DepartmentFormProps {
  mode: "create" | "edit";
  department?: DepartmentDetail;
}

export default function DepartmentForm({ mode, department }: DepartmentFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const isEdit = mode === "edit";

  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment(department?.id ?? "");
  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  const { data: allDepartments } = useDepartmentsForDropdown();
  const { data: allEmployees } = useEmployeesForDropdown();

  const zodResolverTyped = zodResolver(departmentFormSchema) as Resolver<DepartmentFormData>;

  const form = useForm<DepartmentFormData>({
    resolver: zodResolverTyped,
    defaultValues: {
      name: department?.name ?? "",
      parentId: department?.parentId ?? "",
      managerId: department?.managerId ?? "",
      description: department?.description ?? "",
      isActive: department?.isActive ?? true,
    },
  });

  const parentOptions = [
    { value: "", label: t("hr.departments.withoutParent") },
    ...(allDepartments ?? [])
      .filter((d) => d.id !== department?.id)
      .map((d) => ({ value: d.id, label: `${d.code} — ${d.name}` })),
  ];

  const managerOptions = [
    { value: "", label: t("hr.departments.withoutManager") },
    ...(allEmployees ?? []).map((e) => ({
      value: e.id,
      label: `${e.fullName}${e.jobTitle ? ` (${e.jobTitle})` : ""}`,
    })),
  ];

  const onSubmit = async (data: DepartmentFormData) => {
    try {
      if (isEdit && department) {
        await updateMutation.mutateAsync({
          name: data.name,
          parentId: data.parentId || undefined,
          managerId: data.managerId || undefined,
          description: data.description || undefined,
          isActive: data.isActive ?? true,
        });
      } else {
        await createMutation.mutateAsync({
          name: data.name,
          parentId: data.parentId || undefined,
          managerId: data.managerId || undefined,
          description: data.description || undefined,
        });
      }
      router.push("/hr/departments");
    } catch {
      // Error handled via mutation state
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {isEdit ? t("hr.departments.editTitle") : t("hr.departments.newTitle")}
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
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">{t("hr.departments.nameRequired")}</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder={t("hr.departments.enterName")}
                className="h-10"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Parent Department */}
            <div className="space-y-2">
              <Label htmlFor="parentId">{t("hr.departments.parentDepartment")}</Label>
              <Select
                id="parentId"
                {...form.register("parentId")}
                options={parentOptions}
                placeholder={t("hr.departments.selectParent")}
                className="h-10"
              />
            </div>

            {/* Manager */}
            <div className="space-y-2">
              <Label htmlFor="managerId">{t("hr.departments.managerLabel")}</Label>
              <Select
                id="managerId"
                {...form.register("managerId")}
                options={managerOptions}
                placeholder={t("hr.departments.selectManager")}
                className="h-10"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t("hr.departments.descriptionLabel")}</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder={t("hr.departments.descriptionPlaceholder")}
              rows={3}
            />
          </div>

          {/* IsActive Switch (edit only) */}
          {isEdit && (
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <Label htmlFor="isActive" className="cursor-pointer">
                {t("hr.departments.statusLabel")}
              </Label>
              <button
                id="isActive"
                type="button"
                role="switch"
                aria-checked={form.watch("isActive")}
                onClick={() => {
                  const current = form.getValues("isActive");
                  form.setValue("isActive", !current, { shouldValidate: true });
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  form.watch("isActive") ? "bg-emerald-500" : "bg-input"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform ${
                    form.watch("isActive") ? "translate-x-0" : "-translate-x-6"
                  }`}
                />
              </button>
              <span className="text-sm text-muted-foreground">
                {form.watch("isActive") ? t("common.active") : t("common.inactive")}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {isEdit ? t("hr.departments.saveChanges") : t("hr.departments.addNew")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/hr/departments")}
            >
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
