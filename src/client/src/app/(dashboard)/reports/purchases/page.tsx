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
import { useTranslation } from "@/hooks/use-translation";

function formatCurrency(value: number): string {
  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ر.س`;
}

function PurchasesReportContent() {
  const { t } = useTranslation();
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
      header: t("reports.period"),
      render: (item) => item.period,
    },
    {
      key: "spending",
      header: t("reports.spending"),
      render: (item) => (
        <span className="font-medium">{formatCurrency(item.spending)}</span>
      ),
    },
    {
      key: "orderCount",
      header: t("reports.orderCount"),
      render: (item) => item.orderCount.toLocaleString("ar-SA"),
    },
  ];

  const supplierColumns: ReportColumn<TopSupplierItem>[] = [
    {
      key: "supplierName",
      header: t("reports.supplier"),
      render: (item) => item.supplierName,
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
          {t("reports.purchasesLoadFailed")}
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
          <h1 className="text-2xl font-semibold">{t("reports.purchases")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("reports.purchasesDescription")}
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
          title={t("reports.totalSpending")}
          value={formatCurrency(data?.totalSpending ?? 0)}
          icon={TrendingDown}
          iconClassName="text-primary"
          isLoading={isLoading}
        />
        <ReportSummaryCard
          title={t("reports.totalPurchaseOrders")}
          value={(data?.totalOrders ?? 0).toLocaleString("ar-SA")}
          icon={ShoppingBag}
          iconClassName="text-blue-600"
          isLoading={isLoading}
        />
        <ReportSummaryCard
          title={t("reports.averageOrderValue")}
          value={formatCurrency(data?.averageOrderValue ?? 0)}
          icon={ShoppingBag}
          iconClassName="text-violet-600"
          isLoading={isLoading}
        />
        <ReportSummaryCard
          title={t("reports.totalSuppliers")}
          value={(data?.totalSuppliers ?? 0).toLocaleString("ar-SA")}
          icon={Truck}
          iconClassName="text-emerald-600"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ReportDataTable
          title={t("reports.spendingByPeriod")}
          columns={periodColumns}
          data={data?.byPeriod}
          isLoading={isLoading}
          keyAccessor={(item) => item.period}
        />
        <ReportDataTable
          title={t("reports.topContributingSuppliers")}
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