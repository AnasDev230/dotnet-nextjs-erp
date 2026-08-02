"use client";

import { useWatch, type Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { SalesOrderFormData } from "../schemas/sales-order.schema";

interface SalesOrderSummaryProps {
  control: Control<SalesOrderFormData>;
}

function formatCurrency(value: number): string {
  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ر.س`;
}

export default function SalesOrderSummary({ control }: SalesOrderSummaryProps) {
  const items = useWatch<SalesOrderFormData, "items">({
    control,
    name: "items",
  });

  const productsCount = items.length;
  const totalQuantities = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0
  );
  const totalAmount = items.reduce(
    (sum, item) =>
      sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0
  );

  return (
    <Card className="border-border bg-card lg:sticky lg:top-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">ملخص الأمر</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">عدد المنتجات</span>
          <span className="font-medium">{productsCount}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">إجمالي الكميات</span>
          <span className="font-medium">{totalQuantities}</span>
        </div>
        <div className="border-t border-border" />
        <div className="flex items-center justify-between text-sm">
          <span>المجموع</span>
          <span>{formatCurrency(totalAmount)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3 font-semibold">
          <span>الإجمالي النهائي</span>
          <span className="text-primary">{formatCurrency(totalAmount)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
