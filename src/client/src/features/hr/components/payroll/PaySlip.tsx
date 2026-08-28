"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, ReceiptText, Printer } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
} from "@/components/ui";
import { PaySlipPrint } from "@/components/print/pay-slip-print";
import { usePrint } from "@/hooks/use-print";
import { usePayrollRun, usePayrollDetail } from "../../hooks/usePayroll";
import { useTranslation } from "@/hooks/use-translation";
import { formatCurrency, formatNumber, formatWorkHours } from "@/lib/formatters";

interface PaySlipProps {
  runId: string;
  detailId: string;
}

interface SlipRow {
  label: string;
  value: number;
  negative?: boolean;
}

export default function PaySlip({ runId, detailId }: PaySlipProps) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { handlePrint } = usePrint();
  const [showPrint, setShowPrint] = useState(false);
  const { data: run, error: runError } = usePayrollRun(runId);
  const { data: detail, isLoading } = usePayrollDetail(runId, detailId);

  const earningsRows: SlipRow[] = detail
    ? [
        { label: t("payroll.baseSalary"), value: detail.baseSalary },
        { label: t("payroll.transportAllowance"), value: detail.transportAllowance },
        { label: t("payroll.housingAllowance"), value: detail.housingAllowance },
        {
          label: `${t("payroll.overtimePay")} (${formatWorkHours(detail.overtimeHours)})`,
          value: detail.overtimePay,
        },
        { label: t("payroll.otherAllowances"), value: detail.otherAllowances },
      ]
    : [];

  const deductionRows: SlipRow[] = detail
    ? [
        {
          label: `${t("payroll.lateDeduction")} (${formatNumber(detail.lateDays)} ${t("common.days")})`,
          value: detail.lateDeduction,
        },
        {
          label: `${t("payroll.absentDeduction")} (${formatNumber(detail.absentDays)} ${t("common.days")})`,
          value: detail.absentDeduction,
        },
        { label: t("payroll.insuranceDeduction"), value: detail.insuranceDeduction },
        { label: t("payroll.otherDeductions"), value: detail.otherDeductions },
      ]
    : [];

  const renderRows = (rows: SlipRow[]) =>
    rows.map((row) => (
      <div key={row.label} className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">{row.label}</span>
        <span className="tabular-nums">
          {row.negative ? "-" : ""}
          {formatCurrency(row.value, language)}
        </span>
      </div>
    ));

  const monthYear = run ? `${t(`month.${run.month}`)} ${run.year}` : "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold">
              <ReceiptText className="h-6 w-6" />
              {t("payroll.paySlip")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {detail
                ? `${detail.employeeName} — ${monthYear}`
                : monthYear}
            </p>
          </div>
        </div>
        {detail && (
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowPrint(true)}
          >
            <Printer className="h-4 w-4" />
            {t("common.print")}
          </Button>
        )}
      </div>

      {runError || (!isLoading && !detail) ? (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-border">
          <div className="rounded-full bg-muted p-4 mb-4">
            <ReceiptText className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{t("common.noData")}</p>
        </div>
      ) : isLoading || !detail ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Card className="max-w-2xl border-border bg-card">
          <CardContent className="p-6 space-y-6">
            {/* Earnings */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">{t("payroll.earnings")}</h4>
              <div className="space-y-1.5 text-sm">
                {renderRows(earningsRows)}
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-border pt-2 text-sm font-semibold">
                <span>{t("payroll.totalEarnings")}</span>
                <span className="tabular-nums text-emerald-600">
                  {formatCurrency(detail.totalEarnings, language)}
                </span>
              </div>
            </div>

            {/* Deductions */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">{t("payroll.deductions")}</h4>
              <div className="space-y-1.5 text-sm">
                {renderRows(deductionRows)}
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-border pt-2 text-sm font-semibold">
                <span>{t("payroll.totalDeductions")}</span>
                <span className="tabular-nums text-red-600">
                  -{formatCurrency(detail.totalDeductions, language)}
                </span>
              </div>
            </div>

            {/* Net Pay */}
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 p-4">
              <span className="font-semibold">{t("payroll.netPay")}</span>
              <span className="text-lg font-bold tabular-nums text-emerald-600">
                {formatCurrency(detail.netPay, language)}
              </span>
            </div>

            {/* Attendance summary */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span>{t("payroll.details")}:</span>
              <span>
                {t("attendance.presentDays")}: {formatNumber(detail.presentDays)}
              </span>
              <span>|</span>
              <span>
                {t("attendance.lateDays")}: {formatNumber(detail.lateDays)}
              </span>
              <span>|</span>
              <span>
                {t("attendance.absentDays")}: {formatNumber(detail.absentDays)}
              </span>
              <span>|</span>
              <span>
                {t("attendance.overtime")}: {formatWorkHours(detail.overtimeHours)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {showPrint && detail && (
        <div className="fixed inset-0 z-50 bg-white overflow-auto">
          <div className="no-print flex items-center justify-between p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-lg">{t("print.preview")}</h3>
            <div className="flex gap-2">
              <Button onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" />
                {t("print.print")}
              </Button>
              <Button variant="outline" onClick={() => setShowPrint(false)}>
                {t("print.close")}
              </Button>
            </div>
          </div>
          <PaySlipPrint detail={detail} run={run} />
        </div>
      )}
    </div>
  );
}
