"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input, Button } from "@/components/ui";
import { purchaseOrderStatusOptions } from "../schemas/purchase-order.schema";
import { useSuppliersForDropdown } from "../hooks/useSuppliersForDropdown";

const selectClass =
  "flex h-10 w-44 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function PurchaseOrderFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
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
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      updateParams({ search: search || undefined });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, updateParams]);

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
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="بحث برقم الأمر أو المورد..."
          className="h-10 pr-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <select
        value={supplierId}
        onChange={(e) => handleChange("supplierId", e.target.value)}
        className={`${selectClass} w-52`}
      >
        <option value="">كل الموردين</option>
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
        <option value="">كل الحالات</option>
        {purchaseOrderStatusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <Input
        type="date"
        value={fromDate}
        onChange={(e) => handleChange("fromDate", e.target.value)}
        className="h-10 w-40"
        title="من تاريخ"
      />

      <Input
        type="date"
        value={toDate}
        onChange={(e) => handleChange("toDate", e.target.value)}
        className="h-10 w-40"
        title="إلى تاريخ"
      />

      {searchParams.toString() && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(pathname)}
        >
          مسح الفلترة
        </Button>
      )}
    </div>
  );
}
