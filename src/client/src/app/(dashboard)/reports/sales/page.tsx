"use client";

import { Suspense, useState } from "react";
import { TrendingUp, ShoppingCart, Users } from "lucide-react";
import { Alert, AlertTitle, AlertDescription, Button } from "@/components/ui";
import ReportSummaryCard from "@/features/reports/components/ReportSummaryCard";
import ReportDataTable, {
  type ReportColumn,
} from "@/features/reports/components/ReportDataTable";
import ExportCsvButton from "@/features/reports/components/ExportCsvButton";
import DateRangeFilter from "@/features/reports/components/DateRangeFilter";
import { useSalesSummary } from "@/features/reports/hooks/useReports";
import { downloadSalesCsv } from "@/features/reports/api/reports";
import type {
  SalesByPeriodItem,
  TopCustomerItem,
} from "@/types/reports";

function formatCurrency(value: number): string {
  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ر.س`;
}

function SalesReportContent() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const params = {
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  };

  const { data, isLoading, isError, refetch } = useSalesSummary(params);

  const periodColumns: ReportColumn<SalesByPeriodItem>[] = [
    {
      key: "period",
      header: "الفترة",
      render: (item) => item.period,
    },
    {
      key: "revenue",
      header: "الإيراد",
      render: (item) => (
        <span className="font-medium">{formatCurrency(item.revenue)}</span>
      ),
    },
    {
      key: "orderCount",
      header: "عدد الطلبات",
      render: (item) => item.orderCount.toLocaleString("ar-SA"),
    },
  ];

  const customerColumns: ReportColumn<TopCustomerItem>[] = [
    {
      key: "customerName",
      header: "العميل",
      render: (item) => item.customerName,
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
          فشل تحميل تقرير المبيعات.
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
          <h1 className="text-2xl font-semibold">تقرير المبيعات</h1>
          <p className="text-muted-foreground text-sm">
            ملخص أداء المبيعات والإيرادات
          </p>
        </div>
        <ExportCsvButton onClick={() => downloadSalesCsv(params)} />
      </div>

      <DateRangeFilter
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ReportSummaryCard
          title="إجمالي الإيرادات"
          value={formatCurrency(data?.totalRevenue ?? 0)}
          icon={TrendingUp}
          iconClassName="text-primary"
          isLoading={isLoading}
        />
        <ReportSummaryCard
          title="عدد الطلبات"
          value={(data?.totalOrders ?? 0).toLocaleString("ar-SA")}
          icon={ShoppingCart}
          iconClassName="text-blue-600"
          isLoading={isLoading}
        />
        <ReportSummaryCard
          title="متوسط قيمة الطلب"
          value={formatCurrency(data?.averageOrderValue ?? 0)}
          icon={ShoppingCart}
          iconClassName="text-violet-600"
          isLoading={isLoading}
        />
        <ReportSummaryCard
          title="عدد العملاء"
          value={(data?.totalCustomers ?? 0).toLocaleString("ar-SA")}
          icon={Users}
          iconClassName="text-emerald-600"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ReportDataTable
          title="الإيرادات حسب الفترة"
          columns={periodColumns}
          data={data?.byPeriod}
          isLoading={isLoading}
          keyAccessor={(item) => item.period}
        />
        <ReportDataTable
          title="أعلى العملاء إسهامًا"
          columns={customerColumns}
          data={data?.topCustomers}
          isLoading={isLoading}
          keyAccessor={(item) => item.customerId}
        />
      </div>
    </div>
  );
}

export default function SalesReportPage() {
  return (
    <Suspense fallback={null}>
      <SalesReportContent />
    </Suspense>
  );
}