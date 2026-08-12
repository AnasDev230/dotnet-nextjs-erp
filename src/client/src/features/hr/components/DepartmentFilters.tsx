"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input, Button, Select } from "@/components/ui";
import { useTranslation } from "@/hooks/use-translation";

export default function DepartmentFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [isActive, setIsActive] = useState(
    searchParams.get("isActive") ?? "all"
  );

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParamsRef.current.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== "all") params.set(key, value);
        else params.delete(key);
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

  useEffect(() => {
    if (isActive === (searchParams.get("isActive") ?? "all")) return;
    updateParams({ isActive });
  }, [isActive, searchParams, updateParams]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("hr.departments.searchPlaceholder")}
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
          { value: "all", label: t("common.allStatuses") },
          { value: "true", label: t("common.active") },
          { value: "false", label: t("common.inactive") },
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
          {t("common.clearFilters")}
        </Button>
      )}
    </div>
  );
}
