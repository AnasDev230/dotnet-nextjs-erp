"use client";

import { Badge } from "@/components/ui";
import type { PurchaseOrderStatus } from "../types/purchase-order.types";

const statusConfig: Record<
  PurchaseOrderStatus,
  {
    label: string;
    variant:
      | "secondary"
      | "default"
      | "info"
      | "warning"
      | "success"
      | "destructive";
  }
> = {
  Draft: { label: "مسودة", variant: "secondary" },
  Submitted: { label: "مقدمة", variant: "default" },
  Approved: { label: "معتمدة", variant: "info" },
  PartiallyReceived: { label: "استلام جزئي", variant: "warning" },
  Received: { label: "مستلمة بالكامل", variant: "success" },
  Cancelled: { label: "ملغاة", variant: "destructive" },
};

export function PurchaseOrderStatusBadge({
  status,
}: {
  status: PurchaseOrderStatus;
}) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
