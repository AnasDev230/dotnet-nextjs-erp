"use client";

import { useMemo } from "react";
import { useWatch, type Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { SalesOrderFormData } from "../schemas/sales-order.schema";
import type { TaxRate } from "../types/sales-order.types";

interface SalesOrderSummaryProps {
  control: Control<SalesOrderFormData>;
  taxRates: TaxRate[];
}

function formatCurrency(value: number): string {
  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ر.س`;
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export default function SalesOrderSummary({
  control,
  taxRates,
}: SalesOrderSummaryProps) {
  const items = useWatch<SalesOrderFormData, "items">({
    control,
    name: "items",
  });
  const discountPct = useWatch<SalesOrderFormData, "discountPct">({
    control,
    name: "discountPct",
  });
  const taxRateId = useWatch<SalesOrderFormData, "taxRateId">({
    control,
    name: "taxRateId",
  });

  const taxRatesById = useMemo(() => {
    const map = new Map<string, TaxRate>();
    taxRates.forEach((rate) => map.set(rate.id, rate));
    return map;
  }, [taxRates]);

  const selectedTaxRate = taxRateId ? taxRatesById.get(taxRateId) : undefined;
  const taxPct = selectedTaxRate?.rate ?? 0;

  const productsCount = items.length;
  const totalQuantities = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0
  );

  const lineTotals = items.map((item) =>
    roundMoney(
      (Number(item.quantity) || 0) *
        (Number(item.unitPrice) || 0) *
        (1 - (Number(item.discountPct) || 0) / 100)
    )
  );

  const subtotal = roundMoney(lineTotals.reduce((sum, value) => sum + value, 0));
  const orderDiscount = roundMoney(subtotal * ((Number(discountPct) || 0) / 100));
  const taxableAmount = subtotal - orderDiscount;
  const taxAmount = roundMoney(taxableAmount * (taxPct / 100));
  const netAmount = taxableAmount + taxAmount;

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
          <span>المجموع الفرعي</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>
            الخصم
            {Number(discountPct) > 0 && (
              <span className="text-muted-foreground">
                {" "}
                ({discountPct}%)
              </span>
            )}
          </span>
          <span className="text-destructive">
            {orderDiscount > 0 ? `-${formatCurrency(orderDiscount)}` : formatCurrency(orderDiscount)}
          </span>
        </div>

        <div className="border-t border-border" />
        <div className="flex items-center justify-between text-sm">
          <span>الخاضع للضريبة</span>
          <span>{formatCurrency(taxableAmount)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>
            الضريبة
            {selectedTaxRate && (
              <span className="text-muted-foreground">
                {" "}
                ({selectedTaxRate.name} {taxPct}%)
              </span>
            )}
          </span>
          <span>
            {taxAmount > 0 ? `+${formatCurrency(taxAmount)}` : formatCurrency(taxAmount)}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold">
          <span>الإجمالي النهائي</span>
          <span className="text-primary">{formatCurrency(netAmount)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
