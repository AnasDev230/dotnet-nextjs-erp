"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Banknote,
  Eye,
  FileWarning,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  usePayrollRun,
  usePayrollDetails,
  useMarkPayrollPaid,
  useDeletePayrollRun,
} from "../../hooks/usePayroll";
import { useTranslation } from "@/hooks/use-translation";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { PayrollStatus } from "@/types/payroll";

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

export default function PayrollRunDetail({ runId }: { runId: string }) {
  const router = useRouter();
  const { t, language } = useTranslation();

  const { data: run, isLoading: runLoading, error: runError } = usePayrollRun(runId);
  const { data: details, isLoading: detailsLoading } = usePayrollDetails(runId);
  const markPaidMutation = useMarkPayrollPaid();
  const deleteMutation = useDeletePayrollRun();

  const [markPaidOpen, setMarkPaidOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (runLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (runError || !run) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-border">
        <div className="rounded-full bg-muted p-4 mb-4">
          <FileWarning className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">{t("payroll.emptyTitle")}</h3>
        <Button variant="outline" onClick={() => router.push("/hr/payroll")} className="mt-4">
          {t("common.back")}
        </Button>
      </div>
    );
  }

  const handleMarkPaid = () => {
    markPaidMutation.mutate(runId, {
      onSuccess: () => {
        setMarkPaidOpen(false);
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

  const handleDelete = () => {
    deleteMutation.mutate(runId, {
      onSuccess: () => {
        setDeleteOpen(false);
        router.push("/hr/payroll");
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

  const canMarkPaid = run.status === PayrollStatus.Completed;
  const canDelete =
    run.status === PayrollStatus.Draft || run.status === PayrollStatus.Processing;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-mono text-2xl font-semibold">{run.runNumber}</h1>
            <p className="text-muted-foreground text-sm">
              {t(`month.${run.month}`)} {run.year}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canDelete && (
            <Button
              variant="outline"
              onClick={() => {
                setErrorMessage(null);
                setDeleteOpen(true);
              }}
              className="gap-2 text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              {t("common.delete")}
            </Button>
          )}
          {canMarkPaid && (
            <Button
              onClick={() => {
                setErrorMessage(null);
                setMarkPaidOpen(true);
              }}
              className="gap-2"
            >
              <Banknote className="h-4 w-4" />
              {t("payroll.markPaid")}
            </Button>
          )}
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <h2 className="mb-4 text-sm font-semibold">{t("payroll.runSummary")}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">{t("common.status")}</p>
              <div className="mt-1">
                <Badge variant={statusBadgeVariant[run.status]}>
                  {t(statusLabelKey[run.status])}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {t("payroll.employeeCount")}
              </p>
              <p className="mt-1 font-medium tabular-nums">{run.employeeCount}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("payroll.totalNet")}</p>
              <p className="mt-1 font-medium tabular-nums">
                {formatCurrency(run.totalNetAmount, language)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {t("payroll.processedAt")}
              </p>
              <p className="mt-1 text-sm">
                {run.processedAt ? formatDate(run.processedAt, language) : "—"}
              </p>
            </div>
          </div>
          {run.paidAt && (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">{t("payroll.paidAt")}</p>
              <p className="mt-1 text-sm">
                {formatDate(run.paidAt, language)}
              </p>
            </div>
          )}
          {run.notes && (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">{t("common.notes")}</p>
              <p className="mt-1 text-sm">{run.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold">{t("payroll.details")}</h2>
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t("payroll.employee")}</TableHead>
                <TableHead>{t("payroll.baseSalary")}</TableHead>
                <TableHead>{t("payroll.allowances")}</TableHead>
                <TableHead>{t("payroll.deductions")}</TableHead>
                <TableHead>{t("payroll.netPay")}</TableHead>
                <TableHead className="text-end">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detailsLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 w-full animate-pulse rounded bg-muted" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : (details ?? []).map((detail) => (
                    <TableRow key={detail.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{detail.employeeName}</span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {detail.employeeNumber}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatCurrency(detail.baseSalary, language)}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatCurrency(
                          detail.totalEarnings - detail.baseSalary,
                          language
                        )}
                      </TableCell>
                      <TableCell className="tabular-nums text-red-600">
                        {formatCurrency(detail.totalDeductions, language)}
                      </TableCell>
                      <TableCell className="font-semibold tabular-nums text-emerald-600">
                        {formatCurrency(detail.netPay, language)}
                      </TableCell>
                      <TableCell className="text-end">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/hr/payroll/${runId}/payslip/${detail.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              aria-label={t("payroll.paySlip")}
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
        {!detailsLoading && (details?.length ?? 0) > 0 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-sm font-semibold">{t("common.total")}</span>
            <span className="text-sm font-bold tabular-nums text-emerald-600">
              {formatCurrency(run.totalNetAmount, language)}
            </span>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={markPaidOpen}
        onOpenChange={(open) => {
          if (!open) {
            setMarkPaidOpen(false);
            setErrorMessage(null);
          }
        }}
        title={t("payroll.confirm.markPaid.title")}
        description={t("payroll.confirm.markPaid.description")}
        confirmLabel={t("payroll.markPaid")}
        variant="info"
        isLoading={markPaidMutation.isPending}
        errorMessage={errorMessage}
        onConfirm={handleMarkPaid}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteOpen(false);
            setErrorMessage(null);
          }
        }}
        title={t("payroll.confirm.delete.title")}
        description={t("payroll.confirm.delete.description")}
        confirmLabel={t("common.delete")}
        variant="danger"
        isLoading={deleteMutation.isPending}
        errorMessage={errorMessage}
        onConfirm={handleDelete}
      />
    </div>
  );
}
