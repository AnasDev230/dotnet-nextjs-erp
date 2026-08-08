"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import GoodsReceiptsTable from "@/features/purchasing/components/GoodsReceiptsTable";
import GoodsReceiptFilters from "@/features/purchasing/components/GoodsReceiptFilters";
import { useGoodsReceipts } from "@/features/purchasing/hooks/useGoodsReceipts";

function GoodsReceiptsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = 20;
  const search = searchParams.get("search") ?? undefined;
  const fromDate = searchParams.get("fromDate") ?? undefined;
  const toDate = searchParams.get("toDate") ?? undefined;

  const { data, isLoading } = useGoodsReceipts({
    page,
    pageSize,
    search,
    fromDate,
    toDate,
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/purchasing/receipts?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">استلام البضاعة</h1>
          <p className="text-muted-foreground text-sm">
            عمليات استلام البضاعة من الموردين
          </p>
        </div>
        <Button onClick={() => router.push("/purchasing/receipts/new")}>
          <Plus className="ml-2 h-4 w-4" />
          استلام جديد
        </Button>
      </div>

      <GoodsReceiptFilters />

      <GoodsReceiptsTable
        receipts={data?.items ?? []}
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

export default function GoodsReceiptsListPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <GoodsReceiptsContent />
    </Suspense>
  );
}
