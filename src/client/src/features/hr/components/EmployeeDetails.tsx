"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Pencil,
  User,
  Briefcase,
  UserCog,
} from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Select,
  Alert,
} from "@/components/ui";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DetailField } from "@/components/shared/detail-field";
import { DetailSkeleton } from "@/components/shared/detail-skeleton";
import { useEmployee } from "../hooks/useEmployee";
import { useUpdateEmployee } from "../hooks/useUpdateEmployee";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { useTranslation } from "@/hooks/use-translation";
import { EmployeeStatus, EmploymentType } from "@/types/hr";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";

const statusBadgeVariant: Record<EmployeeStatus, "success" | "warning" | "neutral"> = {
  [EmployeeStatus.Active]: "success",
  [EmployeeStatus.OnLeave]: "warning",
  [EmployeeStatus.Terminated]: "neutral",
};

const employmentTypeBadgeVariant: Record<EmploymentType, "success" | "info" | "warning" | "neutral"> = {
  [EmploymentType.FullTime]: "success",
  [EmploymentType.PartTime]: "info",
  [EmploymentType.Contract]: "warning",
  [EmploymentType.Intern]: "neutral",
};

const employmentTypeLabelKey: Record<EmploymentType, string> = {
  [EmploymentType.FullTime]: "hr.employees.fullTime",
  [EmploymentType.PartTime]: "hr.employees.partTime",
  [EmploymentType.Contract]: "hr.employees.contract",
  [EmploymentType.Intern]: "hr.employees.intern",
};

export default function EmployeeDetails({ employeeId }: { employeeId: string }) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [selectedStatus, setSelectedStatus] = useState<EmployeeStatus>(EmployeeStatus.Active);
  const [confirmStatus, setConfirmStatus] = useState<EmployeeStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data: employee, isLoading, error } = useEmployee(employeeId);
  const updateMutation = useUpdateEmployee(employeeId);

  useEffect(() => {
    if (employee) setSelectedStatus(employee.status);
  }, [employee]);

  const statusLabel = (status: EmployeeStatus): string => {
    if (status === EmployeeStatus.Active) return t("hr.employees.active");
    if (status === EmployeeStatus.OnLeave) return t("hr.employees.onLeave");
    return t("hr.employees.terminated");
  };

  const closeConfirm = () => {
    setConfirmStatus(null);
    setErrorMessage(null);
  };

  const handleConfirm = () => {
    if (!employee || confirmStatus === null) return;

    updateMutation.mutate(
      {
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        hireDate: employee.hireDate,
        departmentId: employee.departmentId,
        jobTitle: employee.jobTitle,
        employmentType: employee.employmentType,
        salary: employee.salary,
        managerId: employee.managerId,
        status: confirmStatus,
        userId: employee.userId,
        notes: employee.notes,
      },
      {
        onSuccess: closeConfirm,
        onError: (err: any) => {
          setErrorMessage(
            err?.response?.data?.message ||
              err?.message ||
              t("common.unexpectedError")
          );
        },
      }
    );
  };

  if (isLoading) return <DetailSkeleton />;

  if (error || !employee) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{t("hr.employees.notFound")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("hr.employees.notFoundDescription")}
            </p>
          </div>
        </div>
        {axiosError?.response?.data?.message && (
          <Alert variant="destructive">
            <p>{axiosError.response.data.message}</p>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{employee.fullName}</h1>
            <p className="text-muted-foreground text-sm">
              <span className="font-mono">{employee.employeeNumber}</span> — {t("hr.employees.details")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/hr/employees/${employee.id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Pencil className="h-4 w-4" />
              {t("common.edit")}
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            <span className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              {t("hr.employees.personalInfo")}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailField label={t("hr.employees.employeeNumber")} value={<span className="font-mono">{employee.employeeNumber}</span>} />
            <DetailField label={t("hr.employees.firstName")} value={employee.firstName} />
            <DetailField label={t("hr.employees.lastName")} value={employee.lastName} />
            <DetailField label={t("common.email")} value={employee.email ?? "—"} />
            <DetailField label={t("common.phone")} value={employee.phone ?? "—"} />
            <DetailField label={t("hr.employees.hireDate")} value={formatDate(employee.hireDate, language)} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            <span className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              {t("hr.employees.workInfo")}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailField label={t("hr.employees.department")} value={employee.departmentName ?? t("hr.employees.withoutDepartment")} />
            <DetailField label={t("hr.employees.jobTitle")} value={employee.jobTitle ?? "—"} />
            <DetailField
              label={t("hr.employees.employmentType")}
              value={
                <Badge variant={employmentTypeBadgeVariant[employee.employmentType]}>
                  {t(employmentTypeLabelKey[employee.employmentType])}
                </Badge>
              }
            />
            <DetailField
              label={t("hr.employees.salary")}
              value={<span className="tabular-nums">{formatCurrency(employee.salary, language)}</span>}
            />
            <DetailField label={t("hr.employees.manager")} value={employee.managerName ?? t("hr.employees.withoutManager")} />
            <DetailField
              label={t("hr.employees.statusLabel")}
              value={<Badge variant={statusBadgeVariant[employee.status]}>{statusLabel(employee.status)}</Badge>}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            <span className="flex items-center gap-2">
              <UserCog className="h-4 w-4 text-muted-foreground" />
              {t("hr.employees.systemAccount")}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailField
              label={t("hr.employees.linked")}
              value={
                employee.userId ? (
                  <Badge variant="success">{t("hr.employees.yes")}</Badge>
                ) : (
                  <Badge variant="neutral">{t("hr.employees.no")}</Badge>
                )
              }
            />
            {employee.userName && (
              <DetailField label={t("hr.employees.userName")} value={employee.userName} />
            )}
          </div>
        </CardContent>
      </Card>

      {employee.notes && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{t("hr.employees.notesLabel")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed">{employee.notes}</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("hr.employees.changeStatus")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-full sm:w-64">
              <Select
                value={String(selectedStatus)}
                onChange={(e) => setSelectedStatus(Number(e.target.value) as EmployeeStatus)}
                options={[
                  { value: String(EmployeeStatus.Active), label: t("hr.employees.active") },
                  { value: String(EmployeeStatus.OnLeave), label: t("hr.employees.onLeave") },
                  { value: String(EmployeeStatus.Terminated), label: t("hr.employees.terminated") },
                ]}
              />
            </div>
            <Button
              onClick={() => {
                setErrorMessage(null);
                setConfirmStatus(selectedStatus);
              }}
              disabled={updateMutation.isPending}
            >
              {t("hr.employees.saveStatus")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmStatus !== null && confirmStatus !== employee.status}
        onOpenChange={(open) => !open && closeConfirm()}
        title={t("hr.employees.changeStatusTitle")}
        description={t("hr.employees.changeStatusDescription")}
        confirmLabel={t("hr.employees.saveStatus")}
        variant="warning"
        isLoading={updateMutation.isPending}
        errorMessage={errorMessage}
        onConfirm={handleConfirm}
      />
    </div>
  );
}