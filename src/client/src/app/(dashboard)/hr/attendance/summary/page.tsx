"use client";

import { useState } from "react";
import { CalendarCheck } from "lucide-react";
import {
  Card,
  CardContent,
  Input,
  Select,
} from "@/components/ui";
import { useAttendanceSummary } from "@/features/hr/hooks/useAttendance";
import { useEmployeesForDropdown } from "@/features/hr/hooks/useEmployeesForDropdown";
import { useTranslation } from "@/hooks/use-translation";
import { formatNumber, formatWorkHours } from "@/lib/formatters";
import { EmployeeStatus } from "@/types/hr";

function currentYear(): number {
  return new Date().getFullYear();
}

export default function AttendanceSummaryPage() {
  const { t } = useTranslation();
  const { data: allEmployees } = useEmployeesForDropdown();

  const [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(currentYear()));

  const { data: summary, isLoading } = useAttendanceSummary(
    employeeId || undefined,
    parseInt(year, 10),
    parseInt(month, 10)
  );

  const activeEmployees = (allEmployees ?? []).filter(
    (e) => e.status === EmployeeStatus.Active
  );

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: t(`month.${i + 1}`),
  }));

  const stats = summary
    ? [
        { label: t("attendance.totalDays"), value: summary.totalDays, variant: "text-foreground" },
        { label: t("attendance.presentDays"), value: summary.presentDays, variant: "text-emerald-600" },
        { label: t("attendance.lateDays"), value: summary.lateDays, variant: "text-amber-600" },
        { label: t("attendance.absentDays"), value: summary.absentDays, variant: "text-red-600" },
        { label: t("attendance.leaveDays"), value: summary.leaveDays, variant: "text-blue-600" },
        { label: t("attendance.status.halfDay"), value: summary.halfDayCount, variant: "text-foreground" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("attendance.summary")}</h1>
        <p className="text-muted-foreground text-sm">
          {t("attendance.description")}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          className="h-10 w-56"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          placeholder={t("attendance.selectEmployee")}
          options={activeEmployees.map((e) => ({
            value: e.id,
            label: `${e.fullName} (${e.employeeNumber})`,
          }))}
        />

        <Select
          className="h-10 w-40"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          options={monthOptions}
          aria-label={t("payroll.month")}
        />

        <Input
          type="number"
          min={2000}
          max={2100}
          className="h-10 w-28"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          aria-label={t("payroll.year")}
        />
      </div>

      {!employeeId ? (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-border">
          <div className="rounded-full bg-muted p-4 mb-4">
            <CalendarCheck className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            {t("attendance.selectEmployeeFirst")}
          </p>
        </div>
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border p-6">
              <div className="h-4 w-24 animate-pulse rounded bg-muted mb-2" />
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : !summary || summary.totalDays === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-border">
          <div className="rounded-full bg-muted p-4 mb-4">
            <CalendarCheck className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            {t("attendance.noSummary")}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <Card key={stat.label} className="border-border bg-card">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`mt-2 text-3xl font-semibold tabular-nums ${stat.variant}`}>
                    {formatNumber(stat.value)}
                  </p>
                </CardContent>
              </Card>
            ))}
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">
                  {t("attendance.totalWorkHours")}
                </p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
                  {formatWorkHours(summary.totalWorkHours)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">
                  {t("attendance.totalOvertime")}
                </p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-blue-600">
                  {formatWorkHours(summary.totalOvertimeHours)}
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
