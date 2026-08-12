"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Scale, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import InventoryLevelsTable from "@/features/inventory/components/InventoryLevelsTable";
import InventoryFilters from "@/features/inventory/components/InventoryFilters";
import { useInventoryLevels } from "@/features/inventory/hooks/useInventoryLevels";
import { useWarehousesForDropdown } from "@/features/inventory/hooks/useWarehousesForDropdown";
import { useTranslation } from "@/hooks/use-translation";

function LevelsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = 20;
  const productId = searchParams.get("productId") ?? undefined;
  const warehouseId = searchParams.get("warehouseId") ?? undefined;
  const lowStockOnly = searchParams.get("lowStockOnly") === "true" || undefined;

  const { data, isLoading } = useInventoryLevels({
    page,
    pageSize,
    productId,
    warehouseId,
    lowStockOnly,
  });

  const { data: warehouses, isLoading: warehousesLoading } = useWarehousesForDropdown();

  const warehouseOptions = (warehouses ?? []).map((w) => ({
    value: w.id,
    label: `${w.code} — ${w.name}`,
  }));

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/inventory/levels?${params.toString()}`);
  };

  const handleAdjust = (productId: string, warehouseId: string) => {
    router.push(
      `/inventory/adjustments/new?productId=${productId}&warehouseId=${warehouseId}`
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("inventory.levels.title")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("inventory.levels.listPageDescription")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.push("/inventory/adjustments/new")} className="gap-2">
            <Scale className="h-4 w-4" />
            {t("inventory.levels.newAdjustment")}
          </Button>
          <Button onClick={() => router.push("/inventory/levels/new")} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("inventory.levels.new")}
          </Button>
        </div>
      </div>

      <InventoryFilters
        warehouseOptions={warehouseOptions}
        warehousesLoading={warehousesLoading}
      />

      <InventoryLevelsTable
        levels={data?.items ?? []}
        isLoading={isLoading}
        page={data?.page ?? page}
        pageSize={data?.pageSize ?? pageSize}
        totalCount={data?.totalCount ?? 0}
        totalPages={data?.totalPages ?? 0}
        onPageChange={handlePageChange}
        onAdjust={handleAdjust}
      />
    </div>
  );
}

export default function LevelsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <LevelsContent />
    </Suspense>
  );
}
