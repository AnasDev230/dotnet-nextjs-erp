"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, FolderTree, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import CategoriesTable from "@/features/inventory/components/CategoriesTable";
import CategoryFilters from "@/features/inventory/components/CategoryFilters";
import { useCategories } from "@/features/inventory/hooks/useCategories";
import { useTranslation } from "@/hooks/use-translation";

function CategoriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = 20;
  const search = searchParams.get("search") ?? undefined;

  const { data, isLoading } = useCategories({ page, pageSize, search });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/inventory/categories?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("inventory.categories.title")}</h1>
          <p className="text-muted-foreground text-sm">{t("inventory.categories.description")}</p>
        </div>
        <Button onClick={() => router.push("/inventory/categories/new")} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("inventory.categories.new")}
        </Button>
      </div>

      <CategoryFilters />

      <CategoriesTable
        categories={data?.items ?? []}
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

export default function CategoriesListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <CategoriesContent />
    </Suspense>
  );
}
