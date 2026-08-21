"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui";
import PurchaseReturnsTable from "@/features/purchasing/components/PurchaseReturnsTable";
import PurchaseReturnFilters from "@/features/purchasing/components/PurchaseReturnFilters";
import { usePurchaseReturns } from "@/features/purchasing/hooks/usePurchaseReturns";
import { useTranslation } from "@/hooks/use-translation";
import type { ReturnStatus } from "@/types/returns";

function PurchaseReturnsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = 20;
  const search = searchParams.get("search") ?? undefined;
  const supplierId = searchParams.get("supplierId") ?? undefined;
  const status =
    (searchParams.get("status") as ReturnStatus | null) ?? undefined;
  const fromDate = searchParams.get("fromDate") ?? undefined;
  const toDate = searchParams.get("toDate") ?? undefined;

  const { data, isLoading } = usePurchaseReturns({
    page,
    pageSize,
    search,
    supplierId,
    status,
    fromDate,
    toDate,
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/purchasing/returns?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {t("returns.title.purchase")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("returns.description.purchase")}
          </p>
        </div>
        <Button
          onClick={() => router.push("/purchasing/returns/new")}
          className="gap-2"
        >
          <Undo2 className="h-4 w-4" />
          {t("returns.new.purchase")}
        </Button>
      </div>

      <PurchaseReturnFilters />

      <PurchaseReturnsTable
        purchaseReturns={data?.items ?? []}
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

export default function PurchaseReturnsListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <PurchaseReturnsContent />
    </Suspense>
  );
}