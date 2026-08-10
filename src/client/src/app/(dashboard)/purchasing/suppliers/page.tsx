"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import SuppliersTable from "@/features/purchasing/components/SuppliersTable";
import SupplierFilters from "@/features/purchasing/components/SupplierFilters";
import { useSuppliers } from "@/features/purchasing/hooks/useSuppliers";
import { useTranslation } from "@/hooks/use-translation";

function SuppliersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = 20;
  const search = searchParams.get("search") ?? undefined;
  const status = searchParams.get("status") ?? undefined;

  const { data, isLoading } = useSuppliers({
    page,
    pageSize,
    search,
    status,
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/purchasing/suppliers?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("purchasing.suppliers.title")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("purchasing.suppliers.listPageDescription")}
          </p>
        </div>
        <Button onClick={() => router.push("/purchasing/suppliers/new")}>
          <Plus className="ml-2 h-4 w-4" />
          {t("purchasing.suppliers.new")}
        </Button>
      </div>

      <SupplierFilters />

      <SuppliersTable
        suppliers={data?.items ?? []}
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

export default function SuppliersListPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <SuppliersContent />
    </Suspense>
  );
}
