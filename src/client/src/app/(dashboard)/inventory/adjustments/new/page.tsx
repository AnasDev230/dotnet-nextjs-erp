"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import StockAdjustmentForm from "@/features/inventory/components/StockAdjustmentForm";
import { useWarehousesForDropdown } from "@/features/inventory/hooks/useWarehousesForDropdown";
import { useProducts } from "@/features/inventory/hooks/useProducts";

function NewAdjustmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialProductId = searchParams.get("productId") ?? undefined;
  const initialWarehouseId = searchParams.get("warehouseId") ?? undefined;

  const { data: warehouses, isLoading: warehousesLoading } = useWarehousesForDropdown();
  const { data: productsData, isLoading: productsLoading } = useProducts({ page: 1, pageSize: 1000, isActive: true });

  const warehouseOptions = (warehouses ?? []).map((w) => ({
    value: w.id,
    label: `${w.code} — ${w.name}`,
  }));

  const productOptions = (productsData?.items ?? []).map((p) => ({
    value: p.id,
    label: `${p.sku} — ${p.name}`,
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
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowRight className="ml-2 h-4 w-4" />
          رجوع
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">تسوية مخزون جديدة</h1>
          <p className="text-muted-foreground text-sm">
            تعديل الكمية الفعلية لمنتج في مستودع
          </p>
        </div>
      </div>

      <StockAdjustmentForm
        productOptions={productOptions}
        warehouseOptions={warehouseOptions}
        initialProductId={initialProductId}
        initialWarehouseId={initialWarehouseId}
      />
    </div>
  );
}

export default function NewAdjustmentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <NewAdjustmentContent />
    </Suspense>
  );
}
