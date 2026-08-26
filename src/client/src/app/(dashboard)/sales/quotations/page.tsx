"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileSpreadsheet, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui";
import QuotationsTable from "@/features/sales/components/QuotationsTable";
import QuotationFilters from "@/features/sales/components/QuotationFilters";
import { useQuotations } from "@/features/sales/hooks/useQuotations";
import { useTranslation } from "@/hooks/use-translation";

function QuotationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = 20;
  const statusParam = searchParams.get("status") ?? undefined;
  const customerId = searchParams.get("customerId") ?? undefined;

  const { data, isLoading } = useQuotations({
    page,
    pageSize,
    status: statusParam ? parseInt(statusParam, 10) : undefined,
    customerId,
  });

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/sales/quotations?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("quotation.title")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("quotation.description")}
          </p>
        </div>
        <Button onClick={() => router.push("/sales/quotations/new")} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("quotation.new")}
        </Button>
      </div>

      <QuotationFilters
        status={statusParam}
        customerId={customerId}
        onStatusChange={(value) => updateParam("status", value)}
        onCustomerChange={(value) => updateParam("customerId", value)}
      />

      <QuotationsTable
        quotations={data?.items ?? []}
        isLoading={isLoading}
        page={data?.page ?? page}
        pageSize={data?.pageSize ?? pageSize}
        totalCount={data?.totalCount ?? 0}
        totalPages={data?.totalPages ?? 0}
        onPageChange={(newPage) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("page", String(newPage));
          router.push(`/sales/quotations?${params.toString()}`);
        }}
      />
    </div>
  );
}

export default function QuotationsListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <QuotationsContent />
    </Suspense>
  );
}
