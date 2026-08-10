"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, XCircle, PackageCheck } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
} from "@/components/ui";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useTranslation } from "@/hooks/use-translation";
import { GoodsReceiptStatusBadge } from "./GoodsReceiptStatusBadge";
import { useCancelGoodsReceipt } from "../hooks/useCancelGoodsReceipt";
import type { GoodsReceiptListItem } from "../types/goods-receipt.types";

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("ar-SA");
}

interface GoodsReceiptsTableProps {
  receipts: GoodsReceiptListItem[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function GoodsReceiptsTable({
  receipts,
  isLoading,
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
}: GoodsReceiptsTableProps) {
  const { t } = useTranslation();
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const cancelMutation = useCancelGoodsReceipt();

  const handleCancel = () => {
    if (!cancelId) return;
    cancelMutation.mutate(cancelId, {
      onSuccess: () => {
        setCancelId(null);
        setErrorMessage(null);
      },
      onError: (error: any) => {
        setErrorMessage(
          error?.response?.data?.message ||
            error?.message ||
            t("common.unexpectedError")
        );
      },
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("purchasing.receipts.grnNumber")}</TableHead>
              <TableHead>{t("purchasing.orders.poNumber")}</TableHead>
              <TableHead>{t("purchasing.orders.supplier")}</TableHead>
              <TableHead>{t("purchasing.receipts.receiptDate")}</TableHead>
              <TableHead>{t("purchasing.receipts.warehouse")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead className="text-left">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 7 }).map((_, j) => (
                  <TableCell key={j}>
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-border">
        <div className="rounded-full bg-muted p-4 mb-4">
          <PackageCheck className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">{t("purchasing.receipts.emptyTitle")}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t("purchasing.receipts.emptyDescription")}
        </p>
        <Link href="/purchasing/receipts/new">
          <Button>
            <PackageCheck className="ml-2 h-4 w-4" />
            {t("purchasing.receipts.new")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("purchasing.receipts.grnNumber")}</TableHead>
              <TableHead>{t("purchasing.orders.poNumber")}</TableHead>
              <TableHead>{t("purchasing.orders.supplier")}</TableHead>
              <TableHead>{t("purchasing.receipts.receiptDate")}</TableHead>
              <TableHead>{t("purchasing.receipts.warehouse")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead className="text-left">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.map((receipt) => (
              <TableRow key={receipt.id}>
                <TableCell className="font-medium font-mono text-xs">
                  {receipt.grnNumber}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {receipt.poNumber}
                </TableCell>
                <TableCell>{receipt.supplierName}</TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {formatDate(receipt.receiptDate)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {receipt.warehouseName}
                </TableCell>
                <TableCell>
                  <GoodsReceiptStatusBadge status={receipt.status} />
                </TableCell>
                <TableCell className="text-left">
                  <div className="flex items-center gap-1">
                    <Link href={`/purchasing/receipts/${receipt.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    {receipt.status === "Received" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        title={t("purchasing.receipts.cancelReceipt")}
                        disabled={cancelMutation.isPending}
                        onClick={() => {
                          setErrorMessage(null);
                          setCancelId(receipt.id);
                        }}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            {t("common.showing")} {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, totalCount)} {t("common.of")} {totalCount}
          </p>
          <div className="flex gap-1">
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

      <ConfirmDialog
        open={cancelId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCancelId(null);
            setErrorMessage(null);
          }
        }}
        title={t("purchasing.receipts.cancelReceipt")}
        description={t("purchasing.receipts.cancelDescription")}
        confirmLabel={t("purchasing.receipts.confirmCancel")}
        variant="danger"
        isLoading={cancelMutation.isPending}
        errorMessage={errorMessage}
        onConfirm={handleCancel}
      />
    </>
  );
}
