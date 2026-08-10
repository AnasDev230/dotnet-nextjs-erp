"use client";

import { AlertTriangle, PackageCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import type { LowStockItem } from "@/types/dashboard";
import { useTranslation } from "@/hooks/use-translation";

interface LowStockAlertProps {
  items: LowStockItem[] | undefined;
  isLoading: boolean;
}

export default function LowStockAlert({ items, isLoading }: LowStockAlertProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {t("dashboard.lowStockAlerts")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b py-3 last:border-0"
            >
              <div className="space-y-1">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {t("dashboard.lowStockAlerts")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 rounded-full bg-emerald-500/10 p-3">
              <PackageCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-emerald-600">
              {t("dashboard.stockSufficient")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          {t("dashboard.lowStockAlerts")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.map((item) => (
          <div
            key={`${item.productId}-${item.warehouseName}`}
            className="flex items-center justify-between border-b py-2 last:border-0"
          >
            <div>
              <p className="text-sm font-medium">{item.productName}</p>
              <p className="text-xs text-muted-foreground">
                {item.sku} — {item.warehouseName}
              </p>
            </div>
            <div className="text-left">
              <span className="text-sm font-semibold text-amber-600">
                {item.quantityOnHand.toLocaleString("ar-SA")}
              </span>
              <span className="text-xs text-muted-foreground">
                {" "}
                / {item.reorderLevel.toLocaleString("ar-SA")}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
