"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import StockTransferForm from "@/features/inventory/components/StockTransferForm";
import { useWarehousesForDropdown } from "@/features/inventory/hooks/useWarehousesForDropdown";
import { useProducts } from "@/features/inventory/hooks/useProducts";
import { useTranslation } from "@/hooks/use-translation";

function NewStockTransferContent() {
  const router = useRouter();
  const { t } = useTranslation();

  const { data: warehouses, isLoading: warehousesLoading } =
    useWarehousesForDropdown();
  const { data: productsData, isLoading: productsLoading } = useProducts({
    page: 1,
    pageSize: 1000,
    isActive: true,
  });

  const warehouseOptions = (warehouses ?? []).map((warehouse) => ({
    value: warehouse.id,
    label: `${warehouse.code} — ${warehouse.name}`,
  }));

  const productOptions = (productsData?.items ?? []).map((product) => ({
    value: product.id,
    label: `${product.sku} — ${product.name}`,
  }));

  if (warehousesLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowRight className="h-4 w-4" />
          {t("stockTransfer.back")}
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">
            {t("stockTransfer.createTitle")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("stockTransfer.createPageDescription")}
          </p>
        </div>
      </div>

      <StockTransferForm
        productOptions={productOptions}
        warehouseOptions={warehouseOptions}
      />
    </div>
  );
}

export default function NewStockTransferPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <NewStockTransferContent />
    </Suspense>
  );
}