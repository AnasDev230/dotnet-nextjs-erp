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

function formatCurrency(value: number): string {
  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ر.س`;
}

function InventoryReportContent() {
  const { data, isLoading, isError, refetch } = useInventorySummary();

  const warehouseColumns: ReportColumn<StockByWarehouseItem>[] = [
    {
      key: "warehouseName",
      header: "المستودع",
      render: (item) => item.warehouseName,
    },
    {
      key: "productCount",
      header: "عدد المنتجات",
      render: (item) => item.productCount.toLocaleString("ar-SA"),
    },
    {
      key: "totalValue",
      header: "القيمة الإجمالية",
      render: (item) => (
        <span className="font-medium">{formatCurrency(item.totalValue)}</span>
      ),
    },
  ];

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>
          فشل تحميل تقرير المخزون.
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
          <h1 className="text-2xl font-semibold">تقرير المخزون</h1>
          <p className="text-muted-foreground text-sm">
            مستويات وقيم المخزون في جميع المستودعات
          </p>
        </div>
        <ExportCsvButton onClick={() => downloadInventoryCsv()} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ReportSummaryCard
          title="عدد المنتجات"
          value={(data?.totalProducts ?? 0).toLocaleString("ar-SA")}
          icon={Package}
          iconClassName="text-primary"
          isLoading={isLoading}
        />
        <ReportSummaryCard
          title="عدد المستودعات"
          value={(data?.totalWarehouses ?? 0).toLocaleString("ar-SA")}
          icon={Warehouse}
          iconClassName="text-blue-600"
          isLoading={isLoading}
        />
        <ReportSummaryCard
          title="قيمة المخزون الإجمالية"
          value={formatCurrency(data?.totalInventoryValue ?? 0)}
          icon={Coins}
          iconClassName="text-emerald-600"
          isLoading={isLoading}
        />
        <ReportSummaryCard
          title="أصناف منخفضة"
          value={(data?.lowStockCount ?? 0).toLocaleString("ar-SA")}
          icon={AlertTriangle}
          iconClassName="text-amber-600"
          isLoading={isLoading}
        />
      </div>

      <ReportDataTable
        title="المخزون حسب المستودع"
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