"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button, Select } from "@/components/ui";
import StockTransfersTable from "@/features/inventory/components/StockTransfersTable";
import { useStockTransfers } from "@/features/inventory/hooks/useStockTransfers";
import type { StockTransferStatus } from "@/features/inventory/types/stock-transfer.types";
import { useTranslation } from "@/hooks/use-translation";

const STATUS_FILTER_OPTIONS: { value: string; labelKey: string }[] = [
  { value: "", labelKey: "stockTransfer.allStatuses" },
  { value: "Draft", labelKey: "stockTransfer.status.draft" },
  { value: "Submitted", labelKey: "stockTransfer.status.submitted" },
  { value: "Approved", labelKey: "stockTransfer.status.approved" },
  { value: "Completed", labelKey: "stockTransfer.status.completed" },
  { value: "Cancelled", labelKey: "stockTransfer.status.cancelled" },
];

function StockTransfersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = 20;
  const statusParam = searchParams.get("status");
  const status = (statusParam as StockTransferStatus) || undefined;

  const { data, isLoading } = useStockTransfers({ page, pageSize, status });

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`/inventory/stock-transfers?${params.toString()}`);
  };

  const handleStatusChange = (value: string) => {
    updateParams({ status: value, page: "" });
  };

  const handlePageChange = (newPage: number) => {
    updateParams({ page: String(newPage) });
  };

  const statusOptions = STATUS_FILTER_OPTIONS.map((opt) => ({
    value: opt.value,
    label: t(opt.labelKey),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("stockTransfer.title")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("stockTransfer.description")}
          </p>
        </div>
        <Button
          onClick={() => router.push("/inventory/stock-transfers/new")}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {t("stockTransfer.new")}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={statusParam ?? ""}
          onChange={(e) => handleStatusChange(e.target.value)}
          options={statusOptions}
          className="h-10 w-48"
          aria-label={t("common.status")}
        />
      </div>

      <StockTransfersTable
        transfers={data?.items ?? []}
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

export default function StockTransfersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <StockTransfersContent />
    </Suspense>
  );
}