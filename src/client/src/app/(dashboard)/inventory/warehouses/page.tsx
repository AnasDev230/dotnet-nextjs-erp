"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Warehouse, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import WarehousesTable from "@/features/inventory/components/WarehousesTable";
import WarehouseFilters from "@/features/inventory/components/WarehouseFilters";
import { useWarehouses } from "@/features/inventory/hooks/useWarehouses";

function WarehousesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = 20;
  const search = searchParams.get("search") ?? undefined;
  const isActive = searchParams.get("isActive")
    ? searchParams.get("isActive") === "true"
    : undefined;

  const { data, isLoading } = useWarehouses({ page, pageSize, search, isActive });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/inventory/warehouses?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">المستودعات</h1>
          <p className="text-muted-foreground text-sm">إدارة المستودعات والمواقع</p>
        </div>
        <Button onClick={() => router.push("/inventory/warehouses/new")}>
          <Plus className="ml-2 h-4 w-4" />
          مستودع جديد
        </Button>
      </div>

      <WarehouseFilters />

      <WarehousesTable
        warehouses={data?.items ?? []}
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

export default function WarehousesListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <WarehousesContent />
    </Suspense>
  );
}
