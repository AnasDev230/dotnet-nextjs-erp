"use client";

import { Badge } from "@/components/ui";
import type { SalesOrderStatus } from "../types/sales-order.types";

const statusConfig: Record<
  SalesOrderStatus,
  { label: string; variant: "secondary" | "success" | "destructive" }
> = {
  Draft: { label: "مسودة", variant: "secondary" },
  Confirmed: { label: "مؤكد", variant: "success" },
  Cancelled: { label: "ملغي", variant: "destructive" },
};

export function OrderStatusBadge({ status }: { status: SalesOrderStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
