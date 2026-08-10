"use client";

import { useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input, Button } from "@/components/ui";
import { useTranslation } from "@/hooks/use-translation";

interface InventoryFiltersProps {
  warehouseOptions: { value: string; label: string }[];
  warehousesLoading: boolean;
}

export default function InventoryFilters({
  warehouseOptions,
  warehousesLoading,
}: InventoryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

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
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname]
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("inventory.levels.searchPlaceholder")}
          className="h-10 pr-10"
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => {
            const timer = setTimeout(() => {
              updateParams({ search: e.target.value || undefined });
            }, 300);
            return () => clearTimeout(timer);
          }}
        />
      </div>

      <select
        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={searchParams.get("warehouseId") ?? ""}
        onChange={(e) => updateParams({ warehouseId: e.target.value || undefined })}
        disabled={warehousesLoading}
      >
        <option value="">
          {warehousesLoading ? t("common.loading") : t("inventory.levels.allWarehouses")}
        </option>
        {warehouseOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          checked={searchParams.get("lowStockOnly") === "true"}
          onChange={(e) =>
            updateParams({ lowStockOnly: e.target.checked ? "true" : undefined })
          }
        />
        <span>{t("inventory.levels.lowStockOnly")}</span>
      </label>

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
