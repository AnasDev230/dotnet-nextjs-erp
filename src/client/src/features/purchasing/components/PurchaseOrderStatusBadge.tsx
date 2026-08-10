"use client";

import { Badge } from "@/components/ui";
import { useTranslation } from "@/hooks/use-translation";
import type { PurchaseOrderStatus } from "../types/purchase-order.types";

const statusConfig: Record<
  PurchaseOrderStatus,
  {
    labelKey: string;
    variant:
      | "secondary"
      | "default"
      | "info"
      | "warning"
      | "success"
      | "destructive";
  }
> = {
  Draft: { labelKey: "purchasing.orders.draft", variant: "secondary" },
  Submitted: { labelKey: "purchasing.orders.submitted", variant: "default" },
  Approved: { labelKey: "purchasing.orders.approved", variant: "info" },
  PartiallyReceived: {
    labelKey: "purchasing.orders.partiallyReceived",
    variant: "warning",
  },
  Received: { labelKey: "purchasing.orders.received", variant: "success" },
  Cancelled: { labelKey: "purchasing.orders.cancelled", variant: "destructive" },
};

export function PurchaseOrderStatusBadge({
  status,
}: {
  status: PurchaseOrderStatus;
}) {
  const { t } = useTranslation();
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{t(config.labelKey)}</Badge>;
}