"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import InvoicesTable from "@/features/finance/components/InvoicesTable";
import InvoiceFilters from "@/features/finance/components/InvoiceFilters";
import { useInvoices } from "@/features/finance/hooks/useInvoices";
import { useTranslation } from "@/hooks/use-translation";

function InvoicesContent() {
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

  const { data, isLoading } = useInvoices({
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
    router.push(`/finance/invoices?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("finance.invoices.title")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("finance.invoices.listPageDescription")}
          </p>
        </div>
        <Button onClick={() => router.push("/finance/invoices/new")} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("finance.invoices.new")}
        </Button>
      </div>

      <InvoiceFilters />

      <InvoicesTable
        invoices={data?.items ?? []}
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

export default function InvoicesListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <InvoicesContent />
    </Suspense>
  );
}
