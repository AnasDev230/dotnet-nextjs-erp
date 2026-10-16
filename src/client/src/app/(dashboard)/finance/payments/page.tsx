"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import PaymentsTable from "@/features/finance/components/PaymentsTable";
import PaymentFilters from "@/features/finance/components/PaymentFilters";
import { usePaymentsList } from "@/features/finance/hooks/usePayments";
import { useTranslation } from "@/hooks/use-translation";

function PaymentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = 20;
  const search = searchParams.get("search") ?? undefined;
  const method = searchParams.get("method") ?? undefined;
  const fromDate = searchParams.get("fromDate") ?? undefined;
  const toDate = searchParams.get("toDate") ?? undefined;

  const { data, isLoading } = usePaymentsList({
    page,
    pageSize,
    search,
    method,
    fromDate,
    toDate,
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/finance/payments?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("finance.payments.title")}</h1>
        <p className="text-muted-foreground text-sm">
          {t("finance.payments.listPageDescription")}
        </p>
      </div>

      <PaymentFilters />

      <PaymentsTable
        payments={data?.items ?? []}
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

export default function PaymentsListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <PaymentsContent />
    </Suspense>
  );
}
