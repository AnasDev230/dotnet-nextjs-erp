"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import StockAdjustmentsTable from "@/features/inventory/components/StockAdjustmentsTable";
import { useStockAdjustments } from "@/features/inventory/hooks/useStockAdjustments";

function AdjustmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = 20;

  const { data, isLoading } = useStockAdjustments({ page, pageSize });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/inventory/adjustments?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">سجل التسويات</h1>
          <p className="text-muted-foreground text-sm">
            تاريخ عمليات تسوية المخزون
          </p>
        </div>
        <Button onClick={() => router.push("/inventory/adjustments/new")}>
          <Plus className="ml-2 h-4 w-4" />
          تسوية جديدة
        </Button>
      </div>

      <StockAdjustmentsTable
        adjustments={data?.items ?? []}
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

export default function AdjustmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <AdjustmentsContent />
    </Suspense>
  );
}
