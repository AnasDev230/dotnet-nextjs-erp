"use client";

import { Badge } from "@/components/ui";
import type { SupplierStatus } from "../types/supplier.types";

const statusConfig: Record<
  SupplierStatus,
  { label: string; variant: "success" | "destructive" }
> = {
  Active: { label: "نشط", variant: "success" },
  Suspended: { label: "موقوف", variant: "destructive" },
};

export function SupplierStatusBadge({ status }: { status: SupplierStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
