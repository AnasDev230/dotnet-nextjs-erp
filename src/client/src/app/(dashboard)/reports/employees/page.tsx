"use client";

import { Suspense } from "react";
import { Users, Briefcase, UserCheck, UserMinus } from "lucide-react";
import { Alert, AlertTitle, AlertDescription, Button } from "@/components/ui";
import ReportSummaryCard from "@/features/reports/components/ReportSummaryCard";
import ReportDataTable, {
  type ReportColumn,
} from "@/features/reports/components/ReportDataTable";
import ExportCsvButton from "@/features/reports/components/ExportCsvButton";
import { useEmployeesSummary } from "@/features/reports/hooks/useReports";
import { downloadEmployeesCsv } from "@/features/reports/api/reports";
import type { EmployeesByDepartmentItem } from "@/types/reports";
import { useTranslation } from "@/hooks/use-translation";

function formatCurrency(value: number): string {
  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ر.س`;
}

function EmployeesReportContent() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useEmployeesSummary();

  const departmentColumns: ReportColumn<EmployeesByDepartmentItem>[] = [
    {
      key: "departmentName",
      header: t("hr.employees.department"),
      render: (item) =>
        item.departmentName || (
          <span className="text-muted-foreground">{t("reports.withoutDepartment")}</span>
        ),
    },
    {
      key: "employeeCount",
      header: t("hr.departments.employeeCount"),
      render: (item) => item.employeeCount.toLocaleString("ar-SA"),
    },
    {
      key: "totalSalaries",
      header: t("reports.totalSalaries"),
      render: (item) => (
        <span className="font-medium">{formatCurrency(item.totalSalaries)}</span>
      ),
    },
  ];

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>{t("reports.error")}</AlertTitle>
        <AlertDescription>
          {t("reports.employeesLoadFailed")}
          <Button variant="outline" size="sm" className="mr-2" onClick={() => refetch()}>
            {t("reports.retry")}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("reports.employees")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("reports.employeesDescription")}
          </p>
        </div>
        <ExportCsvButton onClick={() => downloadEmployeesCsv()} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ReportSummaryCard
          title={t("reports.totalEmployees")}
          value={(data?.totalEmployees ?? 0).toLocaleString("ar-SA")}
          icon={Users}
          iconClassName="text-primary"
          isLoading={isLoading}
        />
        <ReportSummaryCard
          title={t("reports.activeEmployees")}
          value={(data?.activeCount ?? 0).toLocaleString("ar-SA")}
          icon={UserCheck}
          iconClassName="text-emerald-600"
          isLoading={isLoading}
        />
        <ReportSummaryCard
          title={t("reports.onLeaveEmployees")}
          value={(data?.onLeaveCount ?? 0).toLocaleString("ar-SA")}
          icon={Briefcase}
          iconClassName="text-amber-600"
          isLoading={isLoading}
        />
        <ReportSummaryCard
          title={t("reports.terminatedEmployees")}
          value={(data?.terminatedCount ?? 0).toLocaleString("ar-SA")}
          icon={UserMinus}
          iconClassName="text-red-600"
          isLoading={isLoading}
        />
      </div>

      <ReportSummaryCard
        title={t("reports.totalMonthlySalaries")}
        value={formatCurrency(data?.totalSalaries ?? 0)}
        icon={Users}
        iconClassName="text-blue-600"
        subtitle={t("reports.totalSalariesSubtitle")}
        isLoading={isLoading}
      />

      <ReportDataTable
        title={t("reports.employeesByDepartment")}
        columns={departmentColumns}
        data={data?.byDepartment}
        isLoading={isLoading}
        keyAccessor={(item) => item.departmentId ?? "none"}
      />
    </div>
  );
}

export default function EmployeesReportPage() {
  return (
    <Suspense fallback={null}>
      <EmployeesReportContent />
    </Suspense>
  );
}