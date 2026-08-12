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
import { useTranslation } from "@/hooks/use-translation";

function formatCurrency(value: number): string {
  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ر.س`;
}

function SalesReportContent() {
  const { t } = useTranslation();
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
      header: t("reports.period"),
      render: (item) => item.period,
    },
    {
      key: "revenue",
      header: t("reports.revenue"),
      render: (item) => (
        <span className="font-medium">{formatCurrency(item.revenue)}</span>
      ),
    },
    {
      key: "orderCount",
      header: t("reports.orderCount"),
      render: (item) => item.orderCount.toLocaleString("ar-SA"),
    },
  ];

  const customerColumns: ReportColumn<TopCustomerItem>[] = [
    {
      key: "customerName",
      header: t("reports.customer"),
      render: (item) => item.customerName,
    },
    {
      key: "totalAmount",
      header: t("reports.totalAmount"),
      render: (item) => (
        <span className="font-medium">{formatCurrency(item.totalAmount)}</span>
      ),
    },
    {
      key: "orderCount",
      header: t("reports.orderCount"),
      render: (item) => item.orderCount.toLocaleString("ar-SA"),
    },
  ];

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>{t("reports.error")}</AlertTitle>
        <AlertDescription>
          {t("reports.salesLoadFailed")}
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
          <h1 className="text-2xl font-semibold">{t("reports.sales")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("reports.salesDescription")}
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
          title={t("reports.totalRevenue")}
          value={formatCurrency(data?.totalRevenue ?? 0)}
          icon={TrendingUp}
          iconClassName="text-primary"
          isLoading={isLoading}
        />
        <ReportSummaryCard
          title={t("reports.totalOrders")}
          value={(data?.totalOrders ?? 0).toLocaleString("ar-SA")}
          icon={ShoppingCart}
          iconClassName="text-blue-600"
          isLoading={isLoading}
        />
        <ReportSummaryCard
          title={t("reports.averageOrderValue")}
          value={formatCurrency(data?.averageOrderValue ?? 0)}
          icon={ShoppingCart}
          iconClassName="text-violet-600"
          isLoading={isLoading}
        />
        <ReportSummaryCard
          title={t("reports.totalCustomers")}
          value={(data?.totalCustomers ?? 0).toLocaleString("ar-SA")}
          icon={Users}
          iconClassName="text-emerald-600"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ReportDataTable
          title={t("reports.revenueByPeriod")}
          columns={periodColumns}
          data={data?.byPeriod}
          isLoading={isLoading}
          keyAccessor={(item) => item.period}
        />
        <ReportDataTable
          title={t("reports.topContributingCustomers")}
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