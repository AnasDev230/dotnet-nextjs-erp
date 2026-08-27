"use client";

import Link from "next/link";
import { Eye, Banknote } from "lucide-react";
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
import { useTranslation } from "@/hooks/use-translation";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  PayrollStatus,
  type PayrollRunListItem,
} from "@/types/payroll";

const statusBadgeVariant: Record<
  PayrollStatus,
  "default" | "info" | "success" | "neutral"
> = {
  [PayrollStatus.Draft]: "neutral",
  [PayrollStatus.Processing]: "info",
  [PayrollStatus.Completed]: "default",
  [PayrollStatus.Paid]: "success",
};

const statusLabelKey: Record<PayrollStatus, string> = {
  [PayrollStatus.Draft]: "payroll.status.draft",
  [PayrollStatus.Processing]: "payroll.status.processing",
  [PayrollStatus.Completed]: "payroll.status.completed",
  [PayrollStatus.Paid]: "payroll.status.paid",
};

interface PayrollRunsTableProps {
  runs: PayrollRunListItem[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function PayrollRunsTable({
  runs,
  isLoading,
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
}: PayrollRunsTableProps) {
  const { t, language } = useTranslation();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t("payroll.runNumber")}</TableHead>
              <TableHead>{t("payroll.month")}</TableHead>
              <TableHead>{t("payroll.employeeCount")}</TableHead>
              <TableHead>{t("payroll.totalNet")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead>{t("payroll.processedAt")}</TableHead>
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

  if (runs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-border">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Banknote className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">{t("payroll.emptyTitle")}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t("payroll.emptyDescription")}
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
              <TableHead>{t("payroll.runNumber")}</TableHead>
              <TableHead>{t("payroll.month")}</TableHead>
              <TableHead>{t("payroll.employeeCount")}</TableHead>
              <TableHead>{t("payroll.totalNet")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead>{t("payroll.processedAt")}</TableHead>
              <TableHead className="text-end">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {runs.map((run) => (
              <TableRow key={run.id}>
                <TableCell>
                  <Link
                    href={`/hr/payroll/${run.id}`}
                    className="font-mono font-medium text-primary hover:underline"
                  >
                    {run.runNumber}
                  </Link>
                </TableCell>
                <TableCell>
                  {t(`month.${run.month}`)} {run.year}
                </TableCell>
                <TableCell className="tabular-nums">
                  {run.employeeCount}
                </TableCell>
                <TableCell className="tabular-nums">
                  {formatCurrency(run.totalNetAmount, language)}
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant[run.status]}>
                    {t(statusLabelKey[run.status])}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {run.processedAt ? formatDate(run.processedAt, language) : "—"}
                </TableCell>
                <TableCell className="text-end">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/hr/payroll/${run.id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label={t("common.view")}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
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
    </>
  );
}
