"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui";
import PayrollRunsTable from "@/features/hr/components/payroll/PayrollRunsTable";
import { usePayrollRuns } from "@/features/hr/hooks/usePayroll";
import { useTranslation } from "@/hooks/use-translation";

function PayrollContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = 20;

  const { data, isLoading } = usePayrollRuns({ page, pageSize });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/hr/payroll?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("payroll.title")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("payroll.description")}
          </p>
        </div>
        <Link href="/hr/payroll/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t("payroll.new")}
          </Button>
        </Link>
      </div>

      <PayrollRunsTable
        runs={data?.items ?? []}
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

export default function PayrollListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <PayrollContent />
    </Suspense>
  );
}
