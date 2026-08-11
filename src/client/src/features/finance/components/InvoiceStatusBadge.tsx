"use client";

import { Badge } from "@/components/ui";
import { useTranslation } from "@/hooks/use-translation";
import type { InvoiceStatus } from "../types/invoice.types";

const statusConfig: Record<
  InvoiceStatus,
  { labelKey: string; variant: "secondary" | "default" | "warning" | "success" | "destructive" }
> = {
  Draft: { labelKey: "finance.invoices.statusDraft", variant: "secondary" },
  Issued: { labelKey: "finance.invoices.statusIssued", variant: "default" },
  PartiallyPaid: { labelKey: "finance.invoices.statusPartiallyPaid", variant: "warning" },
  Paid: { labelKey: "finance.invoices.statusPaid", variant: "success" },
  Cancelled: { labelKey: "finance.invoices.statusCancelled", variant: "destructive" },
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const { t } = useTranslation();
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{t(config.labelKey)}</Badge>;
}
