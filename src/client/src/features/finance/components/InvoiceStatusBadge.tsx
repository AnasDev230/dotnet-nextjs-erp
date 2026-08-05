"use client";

import { Badge } from "@/components/ui";
import type { InvoiceStatus } from "../types/invoice.types";

const statusConfig: Record<
  InvoiceStatus,
  { label: string; variant: "secondary" | "default" | "warning" | "success" | "destructive" }
> = {
  Draft: { label: "مسودة", variant: "secondary" },
  Issued: { label: "صادرة", variant: "default" },
  PartiallyPaid: { label: "مدفوعة جزئياً", variant: "warning" },
  Paid: { label: "مدفوعة", variant: "success" },
  Cancelled: { label: "ملغاة", variant: "destructive" },
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
