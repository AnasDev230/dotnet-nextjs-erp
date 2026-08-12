"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Users } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Badge,
} from "@/components/ui";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useDeleteEmployee } from "../hooks/useDeleteEmployee";
import { useTranslation } from "@/hooks/use-translation";
import { formatDate } from "@/lib/formatters";
import { EmployeeStatus, type EmployeeListItem } from "@/types/hr";

const statusBadgeVariant: Record<EmployeeStatus, "success" | "warning" | "neutral"> = {
  [EmployeeStatus.Active]: "success",
  [EmployeeStatus.OnLeave]: "warning",
  [EmployeeStatus.Terminated]: "neutral",
};

interface EmployeesTableProps {
  employees: EmployeeListItem[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function EmployeesTable({
  employees,
  isLoading,
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
}: EmployeesTableProps) {
  const { t, language } = useTranslation();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const deleteMutation = useDeleteEmployee();

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        setDeleteId(null);
        setErrorMessage(null);
      },
      onError: (error: any) => {
        setErrorMessage(
          error?.response?.data?.message ||
            error?.message ||
            t("common.unexpectedError")
        );
      },
    });
  };

  const statusLabel = (status: EmployeeStatus): string => {
    if (status === EmployeeStatus.Active) return t("hr.employees.active");
    if (status === EmployeeStatus.OnLeave) return t("hr.employees.onLeave");
    return t("hr.employees.terminated");
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t("hr.employees.employeeNoColumn")}</TableHead>
              <TableHead>{t("hr.employees.nameColumn")}</TableHead>
              <TableHead>{t("hr.employees.department")}</TableHead>
              <TableHead>{t("hr.employees.jobTitleColumn")}</TableHead>
              <TableHead>{t("hr.employees.hireDateColumn")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead className="text-end">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 7 }).map((_, j) => (
                  <TableCell key={j}>
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-border">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">{t("hr.employees.emptyTitle")}</h3>
        <p className="text-sm text-muted-foreground mb-4">{t("hr.employees.emptyDescription")}</p>
        <Link href="/hr/employees/new">
          <Button className="gap-2">
            <Users className="h-4 w-4" />
            {t("hr.employees.new")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t("hr.employees.employeeNoColumn")}</TableHead>
              <TableHead>{t("hr.employees.nameColumn")}</TableHead>
              <TableHead>{t("hr.employees.department")}</TableHead>
              <TableHead>{t("hr.employees.jobTitleColumn")}</TableHead>
              <TableHead>{t("hr.employees.hireDateColumn")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead className="text-end">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium font-mono text-xs">{employee.employeeNumber}</TableCell>
                <TableCell>{employee.fullName}</TableCell>
                <TableCell className="text-muted-foreground">
                  {employee.departmentName ?? "—"}
                </TableCell>
                <TableCell>{employee.jobTitle ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {formatDate(employee.hireDate, language)}
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant[employee.status]}>
                    {statusLabel(employee.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-end">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/hr/employees/${employee.id}/edit`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        setErrorMessage(null);
                        setDeleteId(employee.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            {t("common.showing")} {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} {t("common.of")} {totalCount}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              {t("common.previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              {t("common.next")}
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteId(null);
            setErrorMessage(null);
          }
        }}
        title={t("hr.employees.deleteTitle")}
        description={t("hr.employees.deleteDescription")}
        confirmLabel={t("common.delete")}
        variant="danger"
        isLoading={deleteMutation.isPending}
        errorMessage={errorMessage}
        onConfirm={handleDelete}
      />
    </>
  );
}
