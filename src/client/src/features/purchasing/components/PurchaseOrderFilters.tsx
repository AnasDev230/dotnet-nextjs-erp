"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input, Button } from "@/components/ui";
import { useTranslation } from "@/hooks/use-translation";
import { useSuppliersForDropdown } from "../hooks/useSuppliersForDropdown";

const statusOptionKeys = [
  { value: "Draft", labelKey: "purchasing.orders.draft" },
  { value: "Submitted", labelKey: "purchasing.orders.submitted" },
  { value: "Approved", labelKey: "purchasing.orders.approved" },
  { value: "PartiallyReceived", labelKey: "purchasing.orders.partiallyReceived" },
  { value: "Received", labelKey: "purchasing.orders.received" },
  { value: "Cancelled", labelKey: "purchasing.orders.cancelled" },
];

const selectClass =
  "flex h-10 w-44 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function PurchaseOrderFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;
  const { data: suppliers } = useSuppliersForDropdown();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [supplierId, setSupplierId] = useState(
    searchParams.get("supplierId") ?? ""
  );
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [fromDate, setFromDate] = useState(
    searchParams.get("fromDate") ?? ""
  );
  const [toDate, setToDate] = useState(searchParams.get("toDate") ?? "");

  const supplierOptions = (suppliers ?? []).map((supplier) => ({
    value: supplier.id,
    label: `${supplier.code} — ${supplier.name}`,
  }));

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParamsRef.current.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname]
  );

  useEffect(() => {
    const current = searchParams.get("search") ?? "";
    if (search === current) return;
    const timer = setTimeout(() => {
      updateParams({ search: search || undefined });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, searchParams, updateParams]);

  const handleChange = (key: string, value: string) => {
    const setters: Record<string, (v: string) => void> = {
      supplierId: setSupplierId,
      status: setStatus,
      fromDate: setFromDate,
      toDate: setToDate,
    };
    setters[key](value);
    updateParams({ [key]: value || undefined });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("purchasing.orders.searchPlaceholder")}
          className="h-10 ps-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <select
        value={supplierId}
        onChange={(e) => handleChange("supplierId", e.target.value)}
        className={`${selectClass} w-52`}
      >
        <option value="">{t("purchasing.orders.allSuppliers")}</option>
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

      <Input
        type="date"
        value={fromDate}
        onChange={(e) => handleChange("fromDate", e.target.value)}
        className="h-10 w-40"
        title={t("reports.fromDate")}
      />

      <Input
        type="date"
        value={toDate}
        onChange={(e) => handleChange("toDate", e.target.value)}
        className="h-10 w-40"
        title={t("reports.toDate")}
      />

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
