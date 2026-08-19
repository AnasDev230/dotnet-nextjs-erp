"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/use-translation";
import { useSuppliersForDropdown } from "../hooks/useSuppliersForDropdown";

const statusOptionKeys = [
  { value: "Draft", labelKey: "supplierInvoice.status.draft" },
  { value: "Received", labelKey: "supplierInvoice.status.received" },
  { value: "PartiallyPaid", labelKey: "supplierInvoice.status.partiallyPaid" },
  { value: "Paid", labelKey: "supplierInvoice.status.paid" },
  { value: "Cancelled", labelKey: "supplierInvoice.status.cancelled" },
];

const selectClass =
  "flex h-10 w-44 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function SupplierInvoiceFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;
  const { data: suppliers } = useSuppliersForDropdown();

  const [supplierId, setSupplierId] = useState(
    searchParams.get("supplierId") ?? ""
  );
  const [status, setStatus] = useState(searchParams.get("status") ?? "");

  const supplierOptions = (suppliers ?? []).map((supplier) => ({
    value: supplier.id,
    label: `${supplier.code} — ${supplier.name}`,
  }));

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParamsRef.current.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleChange = (key: string, value: string) => {
    if (key === "supplierId") setSupplierId(value);
    if (key === "status") setStatus(value);
    updateParams({ [key]: value || undefined });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={supplierId}
        onChange={(e) => handleChange("supplierId", e.target.value)}
        className={`${selectClass} w-52`}
      >
        <option value="">{t("supplierInvoice.allSuppliers")}</option>
        {supplierOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={status}
        onChange={(e) => handleChange("status", e.target.value)}
        className={selectClass}
      >
        <option value="">{t("common.allStatuses")}</option>
        {statusOptionKeys.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.labelKey)}
          </option>
        ))}
      </select>

      {searchParams.toString() && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(pathname)}
        >
          {t("common.clearFilters")}
        </Button>
      )}
    </div>
  );
}