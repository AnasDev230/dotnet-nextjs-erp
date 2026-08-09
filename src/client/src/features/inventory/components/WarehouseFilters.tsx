"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input, Button } from "@/components/ui";

export default function WarehouseFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [isActive, setIsActive] = useState(searchParams.get("isActive") ?? "");

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

  const handleStatusChange = (value: string) => {
    setIsActive(value);
    updateParams({ isActive: value || undefined });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="بحث برمز أو اسم المستودع..."
          className="h-10 pr-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <select
        value={isActive}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="flex h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">الكل</option>
        <option value="true">نشط</option>
        <option value="false">غير نشط</option>
      </select>

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
