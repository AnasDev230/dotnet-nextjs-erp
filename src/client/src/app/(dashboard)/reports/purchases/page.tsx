"use client";

import { Suspense, useState } from "react";
import { TrendingDown, ShoppingBag, Truck } from "lucide-react";
import { Alert, AlertTitle, AlertDescription, Button } from "@/components/ui";
import ReportSummaryCard from "@/features/reports/components/ReportSummaryCard";
import ReportDataTable, {
  type ReportColumn,
} from "@/features/reports/components/ReportDataTable";
import ExportCsvButton from "@/features/reports/components/ExportCsvButton";
import DateRangeFilter from "@/features/reports/components/DateRangeFilter";
import { usePurchasesSummary } from "@/features/reports/hooks/useReports";
import { downloadPurchasesCsv } from "@/features/reports/api/reports";
import type {
  PurchasesByPeriodItem,
  TopSupplierItem,
} from "@/types/reports";

function formatCurrency(value: number): string {
  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ر.س`;
}

function PurchasesReportContent() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const params = {
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  };

  const { data, isLoading, isError, refetch } = usePurchasesSummary(params);

  const periodColumns: ReportColumn<PurchasesByPeriodItem>[] = [
    {
      key: "period",
      header: "الفترة",
      render: (item) => item.period,
    },
    {
      key: "spending",
      header: "الإنفاق",
      render: (item) => (
        <span className="font-medium">{formatCurrency(item.spending)}</span>
      ),
    },
    {
      key: "orderCount",
      header: "عدد الطلبات",
      render: (item) => item.orderCount.toLocaleString("ar-SA"),
    },
  ];

  const supplierColumns: ReportColumn<TopSupplierItem>[] = [
    {
      key: "supplierName",
      header: "المورد",
      render: (item) => item.supplierName,
    },
    {
      key: "totalAmount",
      header: "إجمالي المبلغ",
      render: (item) => (
        <span className="font-medium">{formatCurrency(item.totalAmount)}</span>
      ),
    },
    {
      key: "orderCount",
      header: "عدد الطلبات",
      render: (item) => item.orderCount.toLocaleString("ar-SA"),
    },
  ];

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>
          فشل تحميل تقرير المشتريات.
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
          <h1 className="text-2xl font-semibold">تقرير المشتريات</h1>
          <p className="text-muted-foreground text-sm">
            ملخص الإنفاق وأوامر الشراء
          </p>
        </div>
        <ExportCsvButton onClick={() => downloadPurchasesCsv(params)} />
      </div>

      <DateRangeFilter
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ReportSummaryCard
          title="إجمالي الإنفاق"
          value={formatCurrency(data?.totalSpending ?? 0)}
          icon={TrendingDown}
          iconClassName="text-primary"
          isLoading={isLoading}
        />
        <ReportSummaryCard
          title="عدد أوامر الشراء"
          value={(data?.totalOrders ?? 0).toLocaleString("ar-SA")}
          icon={ShoppingBag}
          iconClassName="text-blue-600"
          isLoading={isLoading}
        />
        <ReportSummaryCard
          title="متوسط قيمة الطلب"
          value={formatCurrency(data?.averageOrderValue ?? 0)}
          icon={ShoppingBag}
          iconClassName="text-violet-600"
          isLoading={isLoading}
        />
        <ReportSummaryCard
          title="عدد الموردين"
          value={(data?.totalSuppliers ?? 0).toLocaleString("ar-SA")}
          icon={Truck}
          iconClassName="text-emerald-600"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ReportDataTable
          title="الإنفاق حسب الفترة"
          columns={periodColumns}
          data={data?.byPeriod}
          isLoading={isLoading}
          keyAccessor={(item) => item.period}
        />
        <ReportDataTable
          title="أعلى الموردين إسهامًا"
          columns={supplierColumns}
          data={data?.topSuppliers}
          isLoading={isLoading}
          keyAccessor={(item) => item.supplierId}
        />
      </div>
    </div>
  );
}

export default function PurchasesReportPage() {
  return (
    <Suspense fallback={null}>
      <PurchasesReportContent />
    </Suspense>
  );
}