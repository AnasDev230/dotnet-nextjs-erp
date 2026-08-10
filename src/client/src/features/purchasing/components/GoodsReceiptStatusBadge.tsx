"use client";

import { Badge } from "@/components/ui";
import { useTranslation } from "@/hooks/use-translation";
import type { GoodsReceiptStatus } from "../types/goods-receipt.types";

const statusConfig: Record<
  GoodsReceiptStatus,
  { labelKey: string; variant: "success" | "destructive" }
> = {
  Received: { labelKey: "purchasing.receipts.received", variant: "success" },
  Cancelled: { labelKey: "purchasing.receipts.cancelled", variant: "destructive" },
};

export function GoodsReceiptStatusBadge({
  status,
}: {
  status: GoodsReceiptStatus;
}) {
  const { t } = useTranslation();
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{t(config.labelKey)}</Badge>;
}