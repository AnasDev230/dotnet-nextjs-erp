"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import ProductSuppliersTable from "@/features/purchasing/components/ProductSuppliersTable";
import ProductSuppliersFilter from "@/features/purchasing/components/ProductSuppliersFilter";
import { useProductSuppliers } from "@/features/purchasing/hooks/useProductSuppliers";
import { useTranslation } from "@/hooks/use-translation";

function ProductSuppliersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = 20;
  const search = searchParams.get("search") ?? undefined;
  const productId = searchParams.get("productId") ?? undefined;
  const supplierId = searchParams.get("supplierId") ?? undefined;

  const { data, isLoading } = useProductSuppliers({
    page,
    pageSize,
    search,
    productId,
    supplierId,
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/purchasing/product-suppliers?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {t("purchasing.productSuppliers.title")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("purchasing.productSuppliers.listPageDescription")}
          </p>
        </div>
        <Button
          onClick={() =>
            router.push(
              productId
                ? `/purchasing/product-suppliers/new?productId=${productId}`
                : "/purchasing/product-suppliers/new"
            )
          }
        >
          <Plus className="ml-2 h-4 w-4" />
          {t("purchasing.productSuppliers.new")}
        </Button>
      </div>

      <ProductSuppliersFilter />

      <ProductSuppliersTable
        links={data?.items ?? []}
        isLoading={isLoading}
        title={t("purchasing.productSuppliers.emptyTitle")}
        emptyMessage={t("purchasing.productSuppliers.emptyDescription")}
        page={data?.page ?? page}
        pageSize={data?.pageSize ?? pageSize}
        totalCount={data?.totalCount ?? 0}
        totalPages={data?.totalPages ?? 0}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default function ProductSuppliersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ProductSuppliersContent />
    </Suspense>
  );
}
