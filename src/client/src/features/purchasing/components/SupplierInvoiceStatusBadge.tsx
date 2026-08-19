"use client";

import { Badge } from "@/components/ui";
import { useTranslation } from "@/hooks/use-translation";
import type { SupplierInvoiceStatus } from "../types/supplier-invoice.types";

const statusConfig: Record<
  SupplierInvoiceStatus,
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
  Draft: { labelKey: "supplierInvoice.status.draft", variant: "secondary" },
  Received: { labelKey: "supplierInvoice.status.received", variant: "info" },
  PartiallyPaid: {
    labelKey: "supplierInvoice.status.partiallyPaid",
    variant: "warning",
  },
  Paid: { labelKey: "supplierInvoice.status.paid", variant: "success" },
  Cancelled: {
    labelKey: "supplierInvoice.status.cancelled",
    variant: "destructive",
  },
};

export function SupplierInvoiceStatusBadge({
  status,
}: {
  status: SupplierInvoiceStatus;
}) {
  const { t } = useTranslation();
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{t(config.labelKey)}</Badge>;
}