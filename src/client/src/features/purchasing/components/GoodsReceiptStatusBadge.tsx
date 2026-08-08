"use client";

import { Badge } from "@/components/ui";
import type { GoodsReceiptStatus } from "../types/goods-receipt.types";

const statusConfig: Record<
  GoodsReceiptStatus,
  { label: string; variant: "success" | "destructive" }
> = {
  Received: { label: "مستلمة", variant: "success" },
  Cancelled: { label: "ملغية", variant: "destructive" },
};

export function GoodsReceiptStatusBadge({
  status,
}: {
  status: GoodsReceiptStatus;
}) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
