"use client";

import { useState } from "react";
import { CalendarCheck, Trash2 } from "lucide-react";
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
import { useDeleteAttendance } from "../../hooks/useAttendance";
import { useTranslation } from "@/hooks/use-translation";
import { formatDate, formatWorkHours } from "@/lib/formatters";
import {
  AttendanceStatus,
  type AttendanceListItem,
} from "@/types/attendance";

const statusBadgeVariant: Record<
  AttendanceStatus,
  "success" | "warning" | "destructive" | "info" | "neutral"
> = {
  [AttendanceStatus.Present]: "success",
  [AttendanceStatus.Late]: "warning",
  [AttendanceStatus.Absent]: "destructive",
  [AttendanceStatus.Leave]: "info",
  [AttendanceStatus.HalfDay]: "neutral",
};

const statusLabelKey: Record<AttendanceStatus, string> = {
  [AttendanceStatus.Present]: "attendance.status.present",
  [AttendanceStatus.Late]: "attendance.status.late",
  [AttendanceStatus.Absent]: "attendance.status.absent",
  [AttendanceStatus.Leave]: "attendance.status.leave",
  [AttendanceStatus.HalfDay]: "attendance.status.halfDay",
};

interface AttendanceTableProps {
  records: AttendanceListItem[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function formatTime(time: string | null): string {
  if (!time) return "—";
  return time.slice(0, 5);
}

export default function AttendanceTable({
  records,
  isLoading,
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
}: AttendanceTableProps) {
  const { t, language } = useTranslation();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const deleteMutation = useDeleteAttendance();

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        setDeleteId(null);
        setErrorMessage(null);
      },
      onError: (err: any) => {
        setErrorMessage(
          err?.response?.data?.message ||
            err?.message ||
            t("common.unexpectedError")
        );
      },
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t("attendance.employee")}</TableHead>
              <TableHead>{t("attendance.date")}</TableHead>
              <TableHead>{t("attendance.checkIn")}</TableHead>
              <TableHead>{t("attendance.checkOut")}</TableHead>
              <TableHead>{t("attendance.workHours")}</TableHead>
              <TableHead>{t("attendance.overtime")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead className="text-end">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 8 }).map((_, j) => (
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

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-border">
        <div className="rounded-full bg-muted p-4 mb-4">
          <CalendarCheck className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">
          {t("attendance.emptyTitle")}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t("attendance.emptyDescription")}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t("attendance.employee")}</TableHead>
              <TableHead>{t("attendance.date")}</TableHead>
              <TableHead>{t("attendance.checkIn")}</TableHead>
              <TableHead>{t("attendance.checkOut")}</TableHead>
              <TableHead>{t("attendance.workHours")}</TableHead>
              <TableHead>{t("attendance.overtime")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead className="text-end">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{record.employeeName}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {record.employeeNumber}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(record.date, language)}
                </TableCell>
                <TableCell className="tabular-nums">
                  {formatTime(record.checkIn)}
                </TableCell>
                <TableCell className="tabular-nums">
                  {formatTime(record.checkOut)}
                </TableCell>
                <TableCell className="tabular-nums">
                  {record.workHours !== null ? formatWorkHours(record.workHours) : "—"}
                </TableCell>
                <TableCell className="tabular-nums">
                  {record.overtimeHours > 0 ? formatWorkHours(record.overtimeHours) : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant[record.status]}>
                    {t(statusLabelKey[record.status])}
                  </Badge>
                </TableCell>
                <TableCell className="text-end">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        setErrorMessage(null);
                        setDeleteId(record.id);
                      }}
                      aria-label={t("common.delete")}
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
            {t("common.showing")} {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, totalCount)} {t("common.of")} {totalCount}
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
        title={t("attendance.confirm.delete.title")}
        description={t("attendance.confirm.delete.description")}
        confirmLabel={t("common.delete")}
        variant="danger"
        isLoading={deleteMutation.isPending}
        errorMessage={errorMessage}
        onConfirm={handleDelete}
      />
    </>
  );
}
