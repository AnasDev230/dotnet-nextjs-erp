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
import { EmployeeStatus, type EmployeeListItem } from "@/types/hr";

const statusBadgeVariant: Record<EmployeeStatus, "success" | "warning" | "neutral"> = {
  [EmployeeStatus.Active]: "success",
  [EmployeeStatus.OnLeave]: "warning",
  [EmployeeStatus.Terminated]: "neutral",
};

const statusLabel: Record<EmployeeStatus, string> = {
  [EmployeeStatus.Active]: "نشط",
  [EmployeeStatus.OnLeave]: "في إجازة",
  [EmployeeStatus.Terminated]: "مفصول",
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
            "حدث خطأ غير متوقع"
        );
      },
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الرقم الوظيفي</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>القسم</TableHead>
              <TableHead>المسمى الوظيفي</TableHead>
              <TableHead>تاريخ التعيين</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
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
        <h3 className="text-lg font-semibold mb-1">لا يوجد موظفون</h3>
        <p className="text-sm text-muted-foreground mb-4">لم يتم إضافة أي موظفين بعد</p>
        <Link href="/hr/employees/new">
          <Button>
            <Users className="ml-2 h-4 w-4" />
            إضافة موظف
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
            <TableRow>
              <TableHead>الرقم الوظيفي</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>القسم</TableHead>
              <TableHead>المسمى الوظيفي</TableHead>
              <TableHead>تاريخ التعيين</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
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
                  {new Date(employee.hireDate).toLocaleDateString("ar-SA")}
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant[employee.status]}>
                    {statusLabel[employee.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-left">
                  <div className="flex items-center gap-1">
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
            عرض {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} من {totalCount}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              السابق
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              التالي
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
        title="حذف الموظف"
        description="هل أنت متأكد من حذف هذا الموظف؟ لا يمكن حذف موظف يشرف على موظفين آخرين أو يدير أحد الأقسام. لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف"
        variant="danger"
        isLoading={deleteMutation.isPending}
        errorMessage={errorMessage}
        onConfirm={handleDelete}
      />
    </>
  );
}
