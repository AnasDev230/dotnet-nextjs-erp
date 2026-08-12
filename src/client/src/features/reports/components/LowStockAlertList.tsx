"use client";

import { AlertTriangle, PackageCheck } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import type { LowStockItem } from "@/types/reports";
import { useTranslation } from "@/hooks/use-translation";

interface LowStockAlertListProps {
  items: LowStockItem[] | undefined;
  isLoading?: boolean;
}

export default function LowStockAlertList({
  items,
  isLoading,
}: LowStockAlertListProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          {t("reports.lowStock")}
        </CardTitle>
      </CardHeader>
      {isLoading ? (
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
      ) : !items || items.length === 0 ? (
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
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("inventory.products.name")}</TableHead>
              <TableHead>{t("inventory.levels.warehouse")}</TableHead>
              <TableHead>{t("common.quantity")}</TableHead>
              <TableHead>{t("inventory.products.reorderLevel")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow
                key={`${item.productId}-${item.warehouseName}`}
                className="bg-amber-500/5"
              >
                <TableCell>
                  <p className="text-sm font-medium">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">{item.sku}</p>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {item.warehouseName}
                </TableCell>
                <TableCell className="text-sm font-semibold text-amber-600">
                  {item.quantityOnHand.toLocaleString("ar-SA")}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {item.reorderLevel.toLocaleString("ar-SA")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}