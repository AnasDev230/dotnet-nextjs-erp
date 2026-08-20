"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Trash2, Undo2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
} from "@/components/ui";
import { ReturnStatusBadge } from "@/components/shared/return-status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useDeleteSalesReturn } from "../hooks/useSalesReturns";
import { useTranslation } from "@/hooks/use-translation";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { SalesReturnListItem } from "@/types/returns";

interface SalesReturnsTableProps {
  salesReturns: SalesReturnListItem[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function SalesReturnsTable({
  salesReturns,
  isLoading,
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
}: SalesReturnsTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const deleteMutation = useDeleteSalesReturn();
  const { t, language } = useTranslation();

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        setDeleteId(null);
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
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("returns.returnNumber")}
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("returns.customer")}
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("returns.invoice")}
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("returns.returnDate")}
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("returns.totalAmount")}
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("common.status")}
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider text-end">
                {t("common.actions")}
              </TableHead>
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

  if (salesReturns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border py-12 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <Undo2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-1 text-lg font-semibold">{t("returns.emptyTitle")}</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          {t("returns.emptyDescription")}
        </p>
        <Link href="/sales/returns/new">
          <Button className="gap-2">
            <Undo2 className="h-4 w-4" />
            {t("returns.new.sales")}
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
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("returns.returnNumber")}
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("returns.customer")}
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("returns.invoice")}
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("returns.returnDate")}
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("returns.totalAmount")}
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("common.status")}
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider text-end">
                {t("common.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salesReturns.map((salesReturn) => (
              <TableRow key={salesReturn.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="px-4 py-3">
                  <Link
                    href={`/sales/returns/${salesReturn.id}`}
                    className="font-mono text-xs font-medium text-primary hover:underline"
                  >
                    {salesReturn.returnNumber}
                  </Link>
                </TableCell>
                <TableCell className="px-4 py-3 text-sm">
                  {salesReturn.customerName}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Link
                    href={`/finance/invoices/${salesReturn.invoiceId}`}
                    className="font-mono text-xs text-muted-foreground hover:underline"
                  >
                    {salesReturn.invoiceNumber}
                  </Link>
                </TableCell>
                <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                  {formatDate(salesReturn.returnDate, language)}
                </TableCell>
                <TableCell className="px-4 py-3 text-sm tabular-nums">
                  {formatCurrency(salesReturn.totalAmount, language)}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <ReturnStatusBadge status={salesReturn.status} />
                </TableCell>
                <TableCell className="px-4 py-3 text-end">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/sales/returns/${salesReturn.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        setErrorMessage(null);
                        setDeleteId(salesReturn.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteId(null);
            setErrorMessage(null);
          }
        }}
        title={t("returns.confirm.delete.title")}
        description={t("returns.confirm.delete.description")}
        confirmLabel={t("common.delete")}
        variant="danger"
        isLoading={deleteMutation.isPending}
        errorMessage={errorMessage}
        onConfirm={handleDelete}
      />
    </>
  );
}