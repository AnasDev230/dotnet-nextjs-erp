"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import WarehouseForm from "@/features/inventory/components/WarehouseForm";
import { useWarehouse } from "@/features/inventory/hooks/useWarehouse";
import { useTranslation } from "@/hooks/use-translation";

export default function EditWarehousePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { data: warehouse, isLoading, error } = useWarehouse(params.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !warehouse) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{t("inventory.warehouses.notFound")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("inventory.warehouses.notFoundDescription")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{t("inventory.warehouses.editTitle")}</h1>
            <p className="text-muted-foreground text-sm">
              {warehouse.code} — {warehouse.name}
            </p>
          </div>
        </div>
      </div>

      <WarehouseForm mode="edit" warehouse={warehouse} />
    </div>
  );
}
