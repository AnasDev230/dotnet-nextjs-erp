"use client";

import { ClipboardList } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import type { StockAdjustmentItem } from "../types/stock-adjustment.types";

interface StockAdjustmentsTableProps {
  adjustments: StockAdjustmentItem[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function SkeletonRow() {
  return (
    <tr className="border-b">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-muted animate-pulse rounded" />
        </td>
      ))}
    </tr>
  );
}

function VarianceBadge({ variance }: { variance: number }) {
  if (variance > 0) {
    return (
      <Badge
        variant="outline"
        className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      >
        +{variance}
      </Badge>
    );
  }
  if (variance < 0) {
    return (
      <Badge variant="destructive" className="gap-1">
        {variance}
      </Badge>
    );
  }
  return (
    <Badge variant="secondary">
      {variance}
    </Badge>
  );
}

export default function StockAdjustmentsTable({
  adjustments,
  isLoading,
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
}: StockAdjustmentsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border border-border">
        <table className="w-full">
          <thead className="bg-muted/50 text-muted-foreground text-xs font-medium uppercase">
            <tr>
              <th className="px-4 py-3 text-right">المنتج</th>
              <th className="px-4 py-3 text-right">المستودع</th>
              <th className="px-4 py-3 text-right">النظام</th>
              <th className="px-4 py-3 text-right">المعدود</th>
              <th className="px-4 py-3 text-right">الفرق</th>
              <th className="px-4 py-3 text-right">السبب</th>
              <th className="px-4 py-3 text-right">التاريخ</th>
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

  if (adjustments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center rounded-md border border-border">
        <div className="rounded-full bg-muted p-4 mb-4">
          <ClipboardList className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">لا توجد تسويات</h3>
        <p className="text-sm text-muted-foreground mb-4">
          لم يتم إجراء أي تسويات مخزون بعد
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border">
      <table className="w-full">
        <thead className="bg-muted/50 text-muted-foreground text-xs font-medium uppercase">
          <tr>
            <th className="px-4 py-3 text-right">المنتج</th>
            <th className="px-4 py-3 text-right">المستودع</th>
            <th className="px-4 py-3 text-right">النظام</th>
            <th className="px-4 py-3 text-right">المعدود</th>
            <th className="px-4 py-3 text-right">الفرق</th>
            <th className="px-4 py-3 text-right">السبب</th>
            <th className="px-4 py-3 text-right">التاريخ</th>
          </tr>
        </thead>
        <tbody>
          {adjustments.map((adj) => (
            <tr key={adj.id} className="hover:bg-muted/30 border-b">
              <td className="px-4 py-3 text-sm font-medium">
                {adj.productName}
              </td>
              <td className="px-4 py-3 text-sm">{adj.warehouseName}</td>
              <td className="px-4 py-3 text-sm">{adj.systemQty}</td>
              <td className="px-4 py-3 text-sm">{adj.countedQty}</td>
              <td className="px-4 py-3 text-sm">
                <VarianceBadge variance={adj.variance} />
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">
                {adj.reason}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {new Date(adj.createdAt).toLocaleDateString("ar-SA")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
          <span>
            عرض {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} من{" "}
            {totalCount}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              السابق
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              التالي
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
