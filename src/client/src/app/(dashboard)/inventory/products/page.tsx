"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import ProductsTable from "@/features/inventory/components/ProductsTable";
import ProductFilters from "@/features/inventory/components/ProductFilters";
import { useProducts } from "@/features/inventory/hooks/useProducts";
import { useTranslation } from "@/hooks/use-translation";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = 20;
  const search = searchParams.get("search") ?? undefined;
  const categoryId = searchParams.get("categoryId") ?? undefined;
  const isActiveRaw = searchParams.get("isActive");
  const isActive = isActiveRaw ? isActiveRaw === "true" ? true : isActiveRaw === "false" ? false : undefined : undefined;

  const { data, isLoading } = useProducts({
    page,
    pageSize,
    search,
    categoryId,
    isActive,
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/inventory/products?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("inventory.products.title")}</h1>
          <p className="text-muted-foreground text-sm">{t("inventory.products.listPageDescription")}</p>
        </div>
        <Button onClick={() => router.push("/inventory/products/new")} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("inventory.products.new")}
        </Button>
      </div>

      <ProductFilters />

      <ProductsTable
        products={data?.items ?? []}
        isLoading={isLoading}
        page={data?.page ?? page}
        pageSize={data?.pageSize ?? pageSize}
        totalCount={data?.totalCount ?? 0}
        totalPages={data?.totalPages ?? 0}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default function ProductsListPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
