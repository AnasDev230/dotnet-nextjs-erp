"use client";

import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { useTranslation } from "@/hooks/use-translation";
import { formatDate } from "@/lib/formatters";
import type {
  StockTransferStatus,
  StockTransferListItem,
} from "../types/stock-transfer.types";

interface StockTransfersTableProps {
  transfers: StockTransferListItem[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const STATUS_CONFIG: Record<
  StockTransferStatus,
  { labelKey: string; className: string }
> = {
  Draft: {
    labelKey: "stockTransfer.status.draft",
    className: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  },
  Submitted: {
    labelKey: "stockTransfer.status.submitted",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  Approved: {
    labelKey: "stockTransfer.status.approved",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  Completed: {
    labelKey: "stockTransfer.status.completed",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  Cancelled: {
    labelKey: "stockTransfer.status.cancelled",
    className: "bg-red-500/10 text-red-600 border-red-500/20",
  },
};

function StatusBadge({ status }: { status: StockTransferStatus }) {
  const { t } = useTranslation();
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.className}>
      {t(config.labelKey)}
    </Badge>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-muted animate-pulse rounded" />
        </td>
      ))}
    </tr>
  );
}

export default function StockTransfersTable({
  transfers,
  isLoading,
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
}: StockTransfersTableProps) {
  const { t, language } = useTranslation();

  const headers = [
    t("stockTransfer.transferNumber"),
    t("stockTransfer.fromWarehouse"),
    t("stockTransfer.toWarehouse"),
    t("stockTransfer.product"),
    t("stockTransfer.quantity"),
    t("common.status"),
    t("common.createdAt"),
  ];

  if (isLoading) {
    return (
      <div className="rounded-md border border-border">
        <table className="w-full">
          <thead className="bg-muted/50 text-muted-foreground text-xs font-medium uppercase tracking-wider">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 text-start">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (transfers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center rounded-md border border-border">
        <div className="rounded-full bg-muted p-4 mb-4">
          <ArrowLeftRight className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">
          {t("stockTransfer.emptyTitle")}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t("stockTransfer.emptyDescription")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border">
      <table className="w-full">
        <thead className="bg-muted/50 text-muted-foreground text-xs font-medium uppercase tracking-wider">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 text-start">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transfers.map((transfer) => (
            <tr key={transfer.id} className="hover:bg-muted/30 border-b">
              <td className="px-4 py-3 text-sm font-medium">
                <Link
                  href={`/inventory/stock-transfers/${transfer.id}`}
                  className="text-primary hover:underline"
                >
                  {transfer.transferNumber}
                </Link>
              </td>
              <td className="px-4 py-3 text-sm">{transfer.fromWarehouseName}</td>
              <td className="px-4 py-3 text-sm">{transfer.toWarehouseName}</td>
              <td className="px-4 py-3 text-sm">{transfer.productName}</td>
              <td className="px-4 py-3 text-sm tabular-nums">
                {transfer.quantity}
              </td>
              <td className="px-4 py-3 text-sm">
                <StatusBadge status={transfer.status} />
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {formatDate(transfer.createdAt, language)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
          <span>
            {t("common.showing")} {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, totalCount)} {t("common.of")} {totalCount}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              {t("common.previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              {t("common.next")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}