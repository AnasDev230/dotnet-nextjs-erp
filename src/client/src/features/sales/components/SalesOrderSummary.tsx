"use client";

import { useMemo } from "react";
import { useWatch, type Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { SalesOrderFormData } from "../schemas/sales-order.schema";
import type { TaxRate } from "../types/sales-order.types";
import { useTranslation } from "@/hooks/use-translation";
import { formatCurrency } from "@/lib/formatters";

interface SalesOrderSummaryProps {
  control: Control<SalesOrderFormData>;
  taxRates: TaxRate[];
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export default function SalesOrderSummary({
  control,
  taxRates,
}: SalesOrderSummaryProps) {
  const { t, language } = useTranslation();
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
        <CardTitle className="text-lg">{t("sales.orders.summary")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t("sales.orders.itemsCount")}</span>
          <span className="font-medium">{productsCount}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t("sales.orders.totalQuantities")}</span>
          <span className="font-medium">{totalQuantities}</span>
        </div>

        <div className="border-t border-border" />
        <div className="flex items-center justify-between text-sm">
          <span>{t("sales.orders.subtotal")}</span>
          <span>{formatCurrency(subtotal, language)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>
            {t("sales.orders.discount")}
            {Number(discountPct) > 0 && (
              <span className="text-muted-foreground">
                {" "}
                ({discountPct}%)
              </span>
            )}
          </span>
          <span className="text-destructive">
            {orderDiscount > 0 ? `-${formatCurrency(orderDiscount, language)}` : formatCurrency(orderDiscount, language)}
          </span>
        </div>

        <div className="border-t border-border" />
        <div className="flex items-center justify-between text-sm">
          <span>{t("sales.orders.taxable")}</span>
          <span>{formatCurrency(taxableAmount, language)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>
            {t("sales.orders.tax")}
            {selectedTaxRate && (
              <span className="text-muted-foreground">
                {" "}
                ({selectedTaxRate.name} {taxPct}%)
              </span>
            )}
          </span>
          <span>
            {taxAmount > 0 ? `+${formatCurrency(taxAmount, language)}` : formatCurrency(taxAmount, language)}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold">
          <span>{t("sales.orders.grandTotal")}</span>
          <span className="text-primary">{formatCurrency(netAmount, language)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
