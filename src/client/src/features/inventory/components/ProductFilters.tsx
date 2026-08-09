"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui";
import { Button } from "@/components/ui";
import { useCategoriesForDropdown } from "../hooks/useCategoriesForDropdown";

export default function ProductFilters() {
  const { data: categories, isLoading: categoriesLoading } = useCategoriesForDropdown();

  const categoryOptions = (categories ?? []).map((c) => ({
    value: c.id,
    label: `${c.code} — ${c.name}`,
  }));
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParamsRef.current.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
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

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="بحث باسم أو رمز المنتج..."
          className="h-10 pr-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <select
        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={searchParams.get("categoryId") ?? ""}
        onChange={(e) => updateParams({ categoryId: e.target.value || undefined })}
        disabled={categoriesLoading}
      >
        <option value="">
          {categoriesLoading ? "جاري التحميل..." : "جميع التصنيفات"}
        </option>
        {categoryOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={searchParams.get("isActive") ?? ""}
        onChange={(e) =>
          updateParams({ isActive: e.target.value || undefined })
        }
      >
        <option value="">جميع الحالات</option>
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
