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

function formatCurrency(value: number): string {
  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ر.س`;
}

function EmployeesReportContent() {
  const { data, isLoading, isError, refetch } = useEmployeesSummary();

  const departmentColumns: ReportColumn<EmployeesByDepartmentItem>[] = [
    {
      key: "departmentName",
      header: "القسم",
      render: (item) =>
        item.departmentName || (
          <span className="text-muted-foreground">بدون قسم</span>
        ),
    },
    {
      key: "employeeCount",
      header: "عدد الموظفين",
      render: (item) => item.employeeCount.toLocaleString("ar-SA"),
    },
    {
      key: "totalSalaries",
      header: "إجمالي الرواتب",
      render: (item) => (
        <span className="font-medium">{formatCurrency(item.totalSalaries)}</span>
      ),
    },
  ];

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>
          فشل تحميل تقرير الموظفين.
          <Button variant="outline" size="sm" className="mr-2" onClick={() => refetch()}>
            إعادة المحاولة
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">تقرير الموظفين</h1>
          <p className="text-muted-foreground text-sm">
            ملخص الموظفين حسب القسم والحالة والرواتب
          </p>
        </div>
        <ExportCsvButton onClick={() => downloadEmployeesCsv()} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ReportSummaryCard
          title="إجمالي الموظفين"
          value={(data?.totalEmployees ?? 0).toLocaleString("ar-SA")}
          icon={Users}
          iconClassName="text-primary"
          isLoading={isLoading}
        />
        <ReportSummaryCard
          title="موظفون نشطون"
          value={(data?.activeCount ?? 0).toLocaleString("ar-SA")}
          icon={UserCheck}
          iconClassName="text-emerald-600"
          isLoading={isLoading}
        />
        <ReportSummaryCard
          title="في إجازة"
          value={(data?.onLeaveCount ?? 0).toLocaleString("ar-SA")}
          icon={Briefcase}
          iconClassName="text-amber-600"
          isLoading={isLoading}
        />
        <ReportSummaryCard
          title="موظفون منهي خدمتهم"
          value={(data?.terminatedCount ?? 0).toLocaleString("ar-SA")}
          icon={UserMinus}
          iconClassName="text-red-600"
          isLoading={isLoading}
        />
      </div>

      <ReportSummaryCard
        title="إجمالي الرواتب الشهرية"
        value={formatCurrency(data?.totalSalaries ?? 0)}
        icon={Users}
        iconClassName="text-blue-600"
        subtitle="مجموع رواتب جميع الموظفين"
        isLoading={isLoading}
      />

      <ReportDataTable
        title="الموظفون حسب القسم"
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