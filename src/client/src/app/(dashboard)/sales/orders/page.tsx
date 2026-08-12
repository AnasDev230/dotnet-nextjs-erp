"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import SalesOrdersTable from "@/features/sales/components/SalesOrdersTable";
import SalesOrderFilters from "@/features/sales/components/SalesOrderFilters";
import { useSalesOrders } from "@/features/sales/hooks/useSalesOrders";
import { useTranslation } from "@/hooks/use-translation";

function SalesOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = 20;
  const search = searchParams.get("search") ?? undefined;
  const customerId = searchParams.get("customerId") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const fromDate = searchParams.get("fromDate") ?? undefined;
  const toDate = searchParams.get("toDate") ?? undefined;

  const { data, isLoading } = useSalesOrders({
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
    router.push(`/sales/orders?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("sales.orders.title")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("sales.orders.listPageDescription")}
          </p>
        </div>
        <Button onClick={() => router.push("/sales/orders/new")} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("sales.orders.new")}
        </Button>
      </div>

      <SalesOrderFilters />

      <SalesOrdersTable
        orders={data?.items ?? []}
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

export default function SalesOrdersListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SalesOrdersContent />
    </Suspense>
  );
}
