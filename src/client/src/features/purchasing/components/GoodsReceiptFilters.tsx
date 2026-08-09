"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input, Button } from "@/components/ui";

export default function GoodsReceiptFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [fromDate, setFromDate] = useState(
    searchParams.get("fromDate") ?? ""
  );
  const [toDate, setToDate] = useState(searchParams.get("toDate") ?? "");

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
          placeholder="بحث برقم الاستلام أو رقم أمر الشراء..."
          className="h-10 pr-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

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
