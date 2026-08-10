"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input, Button } from "@/components/ui";
import { useSuppliersForDropdown } from "../hooks/useSuppliersForDropdown";
import { useProducts } from "@/features/inventory/hooks/useProducts";
import { useTranslation } from "@/hooks/use-translation";

const selectClass =
  "flex h-10 w-44 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function ProductSuppliersFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;
  const { data: suppliers } = useSuppliersForDropdown();
  const { data: productsData } = useProducts({
    page: 1,
    pageSize: 1000,
    isActive: true,
  });

  const products = productsData?.items ?? [];

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [productId, setProductId] = useState(
    searchParams.get("productId") ?? ""
  );
  const [supplierId, setSupplierId] = useState(
    searchParams.get("supplierId") ?? ""
  );

  const supplierOptions = (suppliers ?? []).map((supplier) => ({
    value: supplier.id,
    label: `${supplier.code} — ${supplier.name}`,
  }));

  const productOptions = products.map((product) => ({
    value: product.id,
    label: `${product.sku} — ${product.name}`,
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
      productId: setProductId,
      supplierId: setSupplierId,
    };
    setters[key](value);
    updateParams({ [key]: value || undefined });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("purchasing.productSuppliers.searchPlaceholder")}
          className="h-10 pr-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <select
        value={productId}
        onChange={(e) => handleChange("productId", e.target.value)}
        className={`${selectClass} w-52`}
      >
        <option value="">{t("common.allProducts")}</option>
        {productOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={supplierId}
        onChange={(e) => handleChange("supplierId", e.target.value)}
        className={`${selectClass} w-52`}
      >
        <option value="">{t("common.allSuppliers")}</option>
        {supplierOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
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
