"use client";

import { Badge } from "@/components/ui";
import { useTranslation } from "@/hooks/use-translation";
import type { PurchasePaymentMethod } from "../types/supplier-invoice.types";

const methodConfig: Record<
  PurchasePaymentMethod,
  { labelKey: string; variant: "secondary" | "default" }
> = {
  Cash: { labelKey: "payment.method.cash", variant: "secondary" },
  BankTransfer: { labelKey: "payment.method.bankTransfer", variant: "default" },
  Card: { labelKey: "payment.method.card", variant: "secondary" },
  Cheque: { labelKey: "payment.method.cheque", variant: "secondary" },
};

export function PaymentMethodBadge({
  method,
}: {
  method: PurchasePaymentMethod;
}) {
  const { t } = useTranslation();
  const config = methodConfig[method];
  return <Badge variant={config.variant}>{t(config.labelKey)}</Badge>;
}