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
import { leaveFormSchema, type LeaveFormData } from "../../schemas/leave.schema";
import { useCreateLeave } from "../../hooks/useCreateLeave";
import { useUpdateLeave } from "../../hooks/useUpdateLeave";
import { useEmployeesForDropdown } from "../../hooks/useEmployeesForDropdown";
import { useTranslation } from "@/hooks/use-translation";
import { LeaveType } from "@/types/leave";
import type { LeaveRequestDetail } from "@/types/leave";

interface LeaveFormProps {
  mode: "create" | "edit";
  leave?: LeaveRequestDetail;
}

export default function LeaveForm({ mode, leave }: LeaveFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const isEdit = mode === "edit";

  const createMutation = useCreateLeave();
  const updateMutation = useUpdateLeave(leave?.id ?? "");
  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  const { data: allEmployees } = useEmployeesForDropdown();

  const zodResolverTyped = zodResolver(leaveFormSchema) as Resolver<LeaveFormData>;

  const form = useForm<LeaveFormData>({
    resolver: zodResolverTyped,
    defaultValues: {
      employeeId: leave?.employeeId ?? "",
      leaveType: leave?.leaveType ?? LeaveType.Annual,
      startDate: leave?.startDate ? leave.startDate.slice(0, 10) : "",
      endDate: leave?.endDate ? leave.endDate.slice(0, 10) : "",
      reason: leave?.reason ?? "",
    },
  });

  const employeeOptions = [
    { value: "", label: t("leave.selectEmployee") },
    ...(allEmployees ?? []).map((e) => ({
      value: e.id,
      label: `${e.fullName} (${e.employeeNumber})`,
    })),
  ];

  const typeOptions = [
    { value: LeaveType.Annual, label: t("leave.type.annual") },
    { value: LeaveType.Sick, label: t("leave.type.sick") },
    { value: LeaveType.Unpaid, label: t("leave.type.unpaid") },
    { value: LeaveType.Maternity, label: t("leave.type.maternity") },
    { value: LeaveType.Emergency, label: t("leave.type.emergency") },
    { value: LeaveType.Other, label: t("leave.type.other") },
  ];

  const onSubmit = async (data: LeaveFormData) => {
    try {
      if (isEdit && leave) {
        const updated = await updateMutation.mutateAsync({
          leaveType: data.leaveType as LeaveType,
          startDate: data.startDate,
          endDate: data.endDate,
          reason: data.reason,
        });
        router.push(`/hr/leaves/${updated.id}`);
      } else {
        const created = await createMutation.mutateAsync({
          employeeId: data.employeeId,
          leaveType: data.leaveType as LeaveType,
          startDate: data.startDate,
          endDate: data.endDate,
          reason: data.reason,
        });
        router.push(`/hr/leaves/${created.id}`);
      }
    } catch {
      // Error handled via mutation state
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {isEdit ? t("leave.editTitle") : t("leave.newTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <p>
              {t("common.error")}:{" "}
              {(error as any)?.response?.data?.message || error.message}
            </p>
          </Alert>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Employee */}
            <div className="space-y-2">
              <Label htmlFor="employeeId">{t("leave.employee")}</Label>
              {isEdit ? (
                <Input
                  id="employeeId"
                  value={leave?.employeeName ?? ""}
                  disabled
                  className="h-10"
                />
              ) : (
                <Select
                  id="employeeId"
                  {...form.register("employeeId")}
                  options={employeeOptions}
                  placeholder={t("leave.selectEmployee")}
                  className="h-10"
                />
              )}
              {form.formState.errors.employeeId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.employeeId.message}
                </p>
              )}
            </div>

            {/* Leave Type */}
            <div className="space-y-2">
              <Label htmlFor="leaveType">{t("leave.type")}</Label>
              <Select
                id="leaveType"
                {...form.register("leaveType")}
                options={typeOptions}
                placeholder={t("leave.selectType")}
                className="h-10"
              />
              {form.formState.errors.leaveType && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.leaveType.message}
                </p>
              )}
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate">{t("leave.startDate")}</Label>
              <Input
                id="startDate"
                type="date"
                {...form.register("startDate")}
                className="h-10"
              />
              {form.formState.errors.startDate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.startDate.message}
                </p>
              )}
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="endDate">{t("leave.endDate")}</Label>
              <Input
                id="endDate"
                type="date"
                {...form.register("endDate")}
                className="h-10"
              />
              {form.formState.errors.endDate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">{t("leave.reason")}</Label>
            <Textarea
              id="reason"
              {...form.register("reason")}
              placeholder={t("leave.reasonPlaceholder")}
              rows={3}
            />
            {form.formState.errors.reason && (
              <p className="text-sm text-destructive">
                {form.formState.errors.reason.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? t("leave.saveChanges") : t("leave.addNew")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
