"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Pencil, Trash2, Building2 } from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Alert,
} from "@/components/ui";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DetailField } from "@/components/shared/detail-field";
import { DetailSkeleton } from "@/components/shared/detail-skeleton";
import { useDepartment } from "../hooks/useDepartment";
import { useDeleteDepartment } from "../hooks/useDeleteDepartment";
import { formatDate } from "@/lib/formatters";
import { useTranslation } from "@/hooks/use-translation";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";

export default function DepartmentDetails({ departmentId }: { departmentId: string }) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data: department, isLoading, error } = useDepartment(departmentId);
  const deleteMutation = useDeleteDepartment();

  const handleDelete = () => {
    deleteMutation.mutate(departmentId, {
      onSuccess: () => router.push("/hr/departments"),
      onError: (err: any) => {
        setErrorMessage(
          err?.response?.data?.message ||
            err?.message ||
            t("common.unexpectedError")
        );
      },
    });
  };

  if (isLoading) return <DetailSkeleton />;

  if (error || !department) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{t("hr.departments.notFound")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("hr.departments.notFoundDescription")}
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
            <h1 className="text-2xl font-semibold">{department.name}</h1>
            <p className="text-muted-foreground text-sm">
              <span className="font-mono">{department.code}</span> — {t("hr.departments.details")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/hr/departments/${department.id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Pencil className="h-4 w-4" />
              {t("common.edit")}
            </Button>
          </Link>
          <Button
            variant="destructive"
            className="gap-2"
            disabled={deleteMutation.isPending}
            onClick={() => {
              setErrorMessage(null);
              setConfirmDelete(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
            {t("common.delete")}
          </Button>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            <span className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              {t("hr.departments.info")}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailField label={t("common.code")} value={<span className="font-mono">{department.code}</span>} />
            <DetailField label={t("common.name")} value={department.name} />
            <DetailField
              label={t("hr.departments.parentDepartment")}
              value={department.parentName ?? t("hr.departments.withoutParent")}
            />
            <DetailField
              label={t("hr.departments.managerLabel")}
              value={department.managerName ?? t("hr.departments.withoutManager")}
            />
            <DetailField label={t("hr.departments.employeeCount")} value={<span className="tabular-nums">{department.employeeCount}</span>} />
            <DetailField
              label={t("common.status")}
              value={
                <Badge variant={department.isActive ? "success" : "neutral"}>
                  {department.isActive ? t("common.active") : t("common.inactive")}
                </Badge>
              }
            />
            <DetailField label={t("common.createdAt")} value={formatDate(department.createdAt, language)} />
            {department.description && (
              <div className="col-span-full">
                <DetailField label={t("hr.departments.descriptionLabel")} value={department.description} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmDelete(false);
            setErrorMessage(null);
          }
        }}
        title={t("hr.departments.deleteTitle")}
        description={t("hr.departments.deleteDescription")}
        confirmLabel={t("common.delete")}
        variant="danger"
        isLoading={deleteMutation.isPending}
        errorMessage={errorMessage}
        onConfirm={handleDelete}
      />
    </div>
  );
}