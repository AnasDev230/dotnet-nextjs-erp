"use client";

import { AlertTriangle, Package } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { useTranslation } from "@/hooks/use-translation";
import type { InventoryLevelListItem } from "../types/inventory-level.types";

interface InventoryLevelsTableProps {
  levels: InventoryLevelListItem[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onAdjust: (productId: string, warehouseId: string) => void;
}

function SkeletonRow() {
  return (
    <tr className="border-b">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-muted animate-pulse rounded" />
        </td>
      ))}
    </tr>
  );
}

export default function InventoryLevelsTable({
  levels,
  isLoading,
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onAdjust,
}: InventoryLevelsTableProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="rounded-md border border-border">
        <table className="w-full">
          <thead className="bg-muted/50 text-muted-foreground text-xs font-medium uppercase">
            <tr>
              <th className="px-4 py-3 text-right">{t("inventory.levels.product")}</th>
              <th className="px-4 py-3 text-right">{t("inventory.levels.warehouse")}</th>
              <th className="px-4 py-3 text-right">{t("inventory.levels.quantity")}</th>
              <th className="px-4 py-3 text-right">{t("inventory.levels.reserved")}</th>
              <th className="px-4 py-3 text-right">{t("inventory.levels.available")}</th>
              <th className="px-4 py-3 text-right">{t("inventory.levels.reorderLevel")}</th>
              <th className="px-4 py-3 text-right">{t("inventory.products.status")}</th>
              <th className="px-4 py-3 text-left">{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (levels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center rounded-md border border-border">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">{t("inventory.levels.emptyTitle")}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t("inventory.levels.emptyDescription")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border">
      <table className="w-full">
        <thead className="bg-muted/50 text-muted-foreground text-xs font-medium uppercase">
          <tr>
            <th className="px-4 py-3 text-right">{t("inventory.levels.product")}</th>
            <th className="px-4 py-3 text-right">{t("inventory.levels.warehouse")}</th>
            <th className="px-4 py-3 text-right">{t("inventory.levels.quantity")}</th>
            <th className="px-4 py-3 text-right">{t("inventory.levels.reserved")}</th>
            <th className="px-4 py-3 text-right">{t("inventory.levels.available")}</th>
            <th className="px-4 py-3 text-right">{t("inventory.levels.reorderLevel")}</th>
            <th className="px-4 py-3 text-right">{t("inventory.products.status")}</th>
            <th className="px-4 py-3 text-left">{t("common.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {levels.map((level) => {
            const availableColor =
              level.quantityAvailable <= 0
                ? "text-red-600 font-medium"
                : level.isLowStock
                ? "text-amber-600 font-medium"
                : "text-emerald-600 font-medium";

            return (
              <tr
                key={level.id}
                className={`hover:bg-muted/30 border-b ${
                  level.isLowStock ? "bg-destructive/5" : ""
                }`}
              >
                <td className="px-4 py-3 text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium">{level.productName}</span>
                    <span className="text-xs text-muted-foreground">
                      {level.productSku}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">{level.warehouseName}</td>
                <td className="px-4 py-3 text-sm">{level.quantityOnHand}</td>
                <td className="px-4 py-3 text-sm">{level.quantityReserved}</td>
                <td className={`px-4 py-3 text-sm ${availableColor}`}>
                  {level.quantityAvailable}
                </td>
                <td className="px-4 py-3 text-sm">{level.reorderLevel}</td>
                <td className="px-4 py-3 text-sm">
                  {level.isLowStock ? (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {t("inventory.levels.lowStock")}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-emerald-600 border-emerald-500/20 bg-emerald-500/10">
                      {t("inventory.levels.good")}
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-left">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAdjust(level.productId, level.warehouseId)}
                  >
                    {t("inventory.levels.adjust")}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
          <span>
            {t("common.showing")} {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} {t("common.of")}{" "}
            {totalCount}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              {t("common.previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              {t("common.next")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
