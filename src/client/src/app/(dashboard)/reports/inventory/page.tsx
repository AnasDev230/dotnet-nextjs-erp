"use client";

import { Suspense } from "react";
import { Package, Warehouse, Coins, AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription, Button } from "@/components/ui";
import ReportSummaryCard from "@/features/reports/components/ReportSummaryCard";
import ReportDataTable, {
  type ReportColumn,
} from "@/features/reports/components/ReportDataTable";
import ExportCsvButton from "@/features/reports/components/ExportCsvButton";
import LowStockAlertList from "@/features/reports/components/LowStockAlertList";
import { useInventorySummary } from "@/features/reports/hooks/useReports";
import { downloadInventoryCsv } from "@/features/reports/api/reports";
import type { StockByWarehouseItem } from "@/types/reports";
import { useTranslation } from "@/hooks/use-translation";

function formatCurrency(value: number): string {
  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ر.س`;
}

function InventoryReportContent() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useInventorySummary();

  const warehouseColumns: ReportColumn<StockByWarehouseItem>[] = [
    {
      key: "warehouseName",
      header: t("reports.warehouse"),
      render: (item) => item.warehouseName,
    },
    {
      key: "productCount",
      header: t("reports.productCount"),
      render: (item) => item.productCount.toLocaleString("ar-SA"),
    },
    {
      key: "totalValue",
      header: t("reports.totalValue"),
      render: (item) => (
        <span className="font-medium">{formatCurrency(item.totalValue)}</span>
      ),
    },
  ];

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>{t("reports.error")}</AlertTitle>
        <AlertDescription>
          {t("reports.inventoryLoadFailed")}
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
          <h1 className="text-2xl font-semibold">{t("reports.inventory")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("reports.inventoryDescription")}
          </p>
        </div>
        <ExportCsvButton onClick={() => downloadInventoryCsv()} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ReportSummaryCard
          title={t("reports.totalProducts")}
          value={(data?.totalProducts ?? 0).toLocaleString("ar-SA")}
          icon={Package}
          iconClassName="text-primary"
          isLoading={isLoading}
        />
        <ReportSummaryCard
          title={t("reports.totalWarehouses")}
          value={(data?.totalWarehouses ?? 0).toLocaleString("ar-SA")}
          icon={Warehouse}
          iconClassName="text-blue-600"
          isLoading={isLoading}
        />
        <ReportSummaryCard
          title={t("reports.totalInventoryValue")}
          value={formatCurrency(data?.totalInventoryValue ?? 0)}
          icon={Coins}
          iconClassName="text-emerald-600"
          isLoading={isLoading}
        />
        <ReportSummaryCard
          title={t("reports.lowStockCount")}
          value={(data?.lowStockCount ?? 0).toLocaleString("ar-SA")}
          icon={AlertTriangle}
          iconClassName="text-amber-600"
          isLoading={isLoading}
        />
      </div>

      <ReportDataTable
        title={t("reports.stockByWarehouse")}
        columns={warehouseColumns}
        data={data?.byWarehouse}
        isLoading={isLoading}
        keyAccessor={(item) => item.warehouseId}
      />

      <LowStockAlertList items={data?.lowStockItems} isLoading={isLoading} />
    </div>
  );
}

export default function InventoryReportPage() {
  return (
    <Suspense fallback={null}>
      <InventoryReportContent />
    </Suspense>
  );
}