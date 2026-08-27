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
  createAttendanceSchema,
  type CreateAttendanceFormData,
} from "../../schemas/attendance.schema";
import { useCreateAttendance } from "../../hooks/useAttendance";
import { useEmployeesForDropdown } from "../../hooks/useEmployeesForDropdown";
import { useTranslation } from "@/hooks/use-translation";
import { AttendanceStatus, type CreateAttendanceRequest } from "@/types/attendance";
import { EmployeeStatus } from "@/types/hr";

const statusOptions = [
  { value: AttendanceStatus.Present, labelKey: "attendance.status.present" },
  { value: AttendanceStatus.Late, labelKey: "attendance.status.late" },
  { value: AttendanceStatus.Absent, labelKey: "attendance.status.absent" },
  { value: AttendanceStatus.Leave, labelKey: "attendance.status.leave" },
  { value: AttendanceStatus.HalfDay, labelKey: "attendance.status.halfDay" },
] as const;

function todayString(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

function toTimeSpan(value: string): string | null {
  return value ? `${value}:00` : null;
}

export default function AttendanceForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const createMutation = useCreateAttendance();
  const error = createMutation.error;
  const { data: allEmployees } = useEmployeesForDropdown();

  const form = useForm<CreateAttendanceFormData>({
    resolver: zodResolver(createAttendanceSchema) as Resolver<CreateAttendanceFormData>,
    defaultValues: {
      employeeId: "",
      date: todayString(),
      checkIn: "",
      checkOut: "",
      breakMinutes: 60,
      status: AttendanceStatus.Present,
      notes: "",
    },
  });

  const activeEmployees = (allEmployees ?? []).filter(
    (e) => e.status === EmployeeStatus.Active
  );

  const onSubmit = async (data: CreateAttendanceFormData) => {
    try {
      await createMutation.mutateAsync({
        employeeId: data.employeeId,
        date: data.date,
        checkIn: toTimeSpan(data.checkIn ?? ""),
        checkOut: toTimeSpan(data.checkOut ?? ""),
        breakMinutes: Number(data.breakMinutes),
        status: data.status as AttendanceStatus,
        notes: data.notes || null,
      } satisfies CreateAttendanceRequest);
      router.push("/hr/attendance");
    } catch {
      // Error handled via mutation state
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{t("attendance.new")}</CardTitle>
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
              <Label htmlFor="employeeId">{t("attendance.employee")} *</Label>
              <Select
                id="employeeId"
                {...form.register("employeeId")}
                placeholder={t("attendance.selectEmployee")}
                className="h-10"
                options={activeEmployees.map((e) => ({
                  value: e.id,
                  label: `${e.fullName} (${e.employeeNumber})`,
                }))}
              />
              {form.formState.errors.employeeId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.employeeId.message}
                </p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">{t("attendance.date")} *</Label>
              <Input id="date" type="date" {...form.register("date")} className="h-10" />
              {form.formState.errors.date && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.date.message}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">{t("common.status")} *</Label>
              <Select
                id="status"
                {...form.register("status")}
                className="h-10"
                options={statusOptions.map((option) => ({
                  value: option.value,
                  label: t(option.labelKey),
                }))}
              />
            </div>

            {/* Break Minutes */}
            <div className="space-y-2">
              <Label htmlFor="breakMinutes">{t("attendance.breakMinutes")}</Label>
              <Input
                id="breakMinutes"
                type="number"
                min={0}
                max={480}
                {...form.register("breakMinutes")}
                className="h-10"
              />
              {form.formState.errors.breakMinutes && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.breakMinutes.message}
                </p>
              )}
            </div>

            {/* Check In */}
            <div className="space-y-2">
              <Label htmlFor="checkIn">{t("attendance.checkIn")}</Label>
              <Input id="checkIn" type="time" {...form.register("checkIn")} className="h-10" />
            </div>

            {/* Check Out */}
            <div className="space-y-2">
              <Label htmlFor="checkOut">{t("attendance.checkOut")}</Label>
              <Input id="checkOut" type="time" {...form.register("checkOut")} className="h-10" />
              {form.formState.errors.checkOut && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.checkOut.message}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t("attendance.notes")}</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder={t("common.notesPlaceholder")}
              rows={3}
            />
            {form.formState.errors.notes && (
              <p className="text-sm text-destructive">
                {form.formState.errors.notes.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={createMutation.isPending} className="gap-2">
              {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("attendance.new")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/hr/attendance")}
            >
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
