"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Loader2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui";
import SalesReturnsTable from "@/features/sales/components/SalesReturnsTable";
import SalesReturnFilters from "@/features/sales/components/SalesReturnFilters";
import { useSalesReturns } from "@/features/sales/hooks/useSalesReturns";
import { useTranslation } from "@/hooks/use-translation";
import type { ReturnStatus } from "@/types/returns";

function SalesReturnsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = 20;
  const search = searchParams.get("search") ?? undefined;
  const customerId = searchParams.get("customerId") ?? undefined;
  const status =
    (searchParams.get("status") as ReturnStatus | null) ?? undefined;
  const fromDate = searchParams.get("fromDate") ?? undefined;
  const toDate = searchParams.get("toDate") ?? undefined;

  const { data, isLoading } = useSalesReturns({
    page,
    pageSize,
    search,
    customerId,
    status,
    fromDate,
    toDate,
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/sales/returns?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("returns.title.sales")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("returns.listPageDescription")}
          </p>
        </div>
        <Button
          onClick={() => router.push("/sales/returns/new")}
          className="gap-2"
        >
          <Undo2 className="h-4 w-4" />
          {t("returns.new.sales")}
        </Button>
      </div>

      <SalesReturnFilters />

      <SalesReturnsTable
        salesReturns={data?.items ?? []}
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

export default function SalesReturnsListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SalesReturnsContent />
    </Suspense>
  );
}