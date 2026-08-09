"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input, Button, Select } from "@/components/ui";

export default function DepartmentFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [isActive, setIsActive] = useState(
    searchParams.get("isActive") ?? "all"
  );

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== "all") params.set(key, value);
        else params.delete(key);
      });
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

  useEffect(() => {
    updateParams({ isActive });
  }, [isActive, updateParams]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="بحث باسم أو رمز القسم..."
          className="h-10 pr-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Select
        className="h-10 w-40"
        value={isActive}
        onChange={(e) => setIsActive(e.target.value)}
        options={[
          { value: "all", label: "كل الحالات" },
          { value: "true", label: "نشط" },
          { value: "false", label: "غير نشط" },
        ]}
      />

      {searchParams.toString() && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSearch("");
            setIsActive("all");
            router.push(pathname);
          }}
        >
          مسح الفلترة
        </Button>
      )}
    </div>
  );
}
