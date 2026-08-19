"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui";
import SupplierInvoicesTable from "@/features/purchasing/components/SupplierInvoicesTable";
import SupplierInvoiceFilters from "@/features/purchasing/components/SupplierInvoiceFilters";
import { useSupplierInvoices } from "@/features/purchasing/hooks/useSupplierInvoices";
import { useTranslation } from "@/hooks/use-translation";

function SupplierInvoicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = 20;
  const status = searchParams.get("status") ?? undefined;
  const supplierId = searchParams.get("supplierId") ?? undefined;

  const { data, isLoading } = useSupplierInvoices({
    page,
    pageSize,
    status,
    supplierId,
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/purchasing/supplier-invoices?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("supplierInvoice.title")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("supplierInvoice.listPageDescription")}
          </p>
        </div>
        <Button
          onClick={() => router.push("/purchasing/supplier-invoices/new")}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {t("supplierInvoice.new")}
        </Button>
      </div>

      <SupplierInvoiceFilters />

      <SupplierInvoicesTable
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

export default function SupplierInvoicesListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
      }
    >
      <SupplierInvoicesContent />
    </Suspense>
  );
}