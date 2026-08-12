"use client";

import { useWatch, type Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { formatCurrency } from "@/lib/formatters";
import { useTranslation } from "@/hooks/use-translation";
import type { PurchaseOrderFormData } from "../schemas/purchase-order.schema";

interface PurchaseOrderSummaryProps {
  control: Control<PurchaseOrderFormData>;
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export default function PurchaseOrderSummary({
  control,
}: PurchaseOrderSummaryProps) {
  const { t, language } = useTranslation();
  const items = useWatch<PurchaseOrderFormData, "items">({
    control,
    name: "items",
  });

  const productsCount = items.length;
  const totalQuantities = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0
  );

  const lineTotals = items.map((item) =>
    roundMoney(
      (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
    )
  );
  const subtotal = roundMoney(lineTotals.reduce((sum, value) => sum + value, 0));

  return (
    <Card className="border-border bg-card lg:sticky lg:top-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{t("purchasing.orders.summaryTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t("purchasing.orders.itemsCount")}</span>
          <span className="font-medium">{productsCount}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t("purchasing.orders.totalQuantities")}</span>
          <span className="font-medium">{totalQuantities}</span>
        </div>

        <div className="border-t border-border" />
        <div className="flex items-center justify-between text-sm">
          <span>{t("purchasing.orders.subtotal")}</span>
          <span className="font-medium">{formatCurrency(subtotal, language)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
