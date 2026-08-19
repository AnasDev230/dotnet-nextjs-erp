"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import StockTransferForm from "@/features/inventory/components/StockTransferForm";
import { useWarehousesForDropdown } from "@/features/inventory/hooks/useWarehousesForDropdown";
import { useProducts } from "@/features/inventory/hooks/useProducts";
import { useStockTransfer } from "@/features/inventory/hooks/useStockTransfer";
import { useTranslation } from "@/hooks/use-translation";

export default function EditStockTransferPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();

  const {
    data: transfer,
    isLoading,
    error,
  } = useStockTransfer(params.id);
  const { data: warehouses, isLoading: warehousesLoading } =
    useWarehousesForDropdown();
  const { data: productsData, isLoading: productsLoading } = useProducts({
    page: 1,
    pageSize: 1000,
    isActive: true,
  });

  if (isLoading || warehousesLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !transfer || !warehouses || !productsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              {t("stockTransfer.notFound")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("stockTransfer.notFoundDescription")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (transfer.status !== "Draft") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              {t("stockTransfer.editNotAllowed")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("stockTransfer.editNotAllowedDescription")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const warehouseOptions = warehouses.map((warehouse) => ({
    value: warehouse.id,
    label: `${warehouse.code} — ${warehouse.name}`,
  }));

  const productOptions = productsData.items.map((product) => ({
    value: product.id,
    label: `${product.sku} — ${product.name}`,
  }));

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
            {t("stockTransfer.editTitle")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {transfer.transferNumber}
          </p>
        </div>
      </div>

      <StockTransferForm
        transfer={transfer}
        productOptions={productOptions}
        warehouseOptions={warehouseOptions}
      />
    </div>
  );
}