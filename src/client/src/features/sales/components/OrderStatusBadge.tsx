"use client";

import { Badge } from "@/components/ui";
import { useTranslation } from "@/hooks/use-translation";
import type { SalesOrderStatus } from "../types/sales-order.types";

const statusConfig: Record<
  SalesOrderStatus,
  { labelKey: string; variant: "secondary" | "success" | "destructive" }
> = {
  Draft: { labelKey: "sales.orders.draft", variant: "secondary" },
  Confirmed: { labelKey: "sales.orders.confirmed", variant: "success" },
  Cancelled: { labelKey: "sales.orders.cancelled", variant: "destructive" },
};

export function OrderStatusBadge({ status }: { status: SalesOrderStatus }) {
  const { t } = useTranslation();
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{t(config.labelKey)}</Badge>;
}