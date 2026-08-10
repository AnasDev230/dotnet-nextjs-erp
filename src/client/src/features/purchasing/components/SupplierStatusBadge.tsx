"use client";

import { Badge } from "@/components/ui";
import { useTranslation } from "@/hooks/use-translation";
import type { SupplierStatus } from "../types/supplier.types";

const statusLabelKey: Record<SupplierStatus, string> = {
  Active: "purchasing.suppliers.active",
  Suspended: "purchasing.suppliers.suspended",
};

const statusVariant: Record<SupplierStatus, "success" | "destructive"> = {
  Active: "success",
  Suspended: "destructive",
};

export function SupplierStatusBadge({ status }: { status: SupplierStatus }) {
  const { t } = useTranslation();
  return <Badge variant={statusVariant[status]}>{t(statusLabelKey[status])}</Badge>;
}