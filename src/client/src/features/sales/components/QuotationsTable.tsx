"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, FileSpreadsheet, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Badge,
} from "@/components/ui";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useDeleteQuotation } from "../hooks/useQuotations";
import { useTranslation } from "@/hooks/use-translation";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  getQuotationStatusConfig,
  normalizeQuotationStatus,
  QuotationStatus,
  type QuotationListItem,
} from "../types/quotation.types";

interface QuotationsTableProps {
  quotations: QuotationListItem[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function QuotationsTable({
  quotations,
  isLoading,
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
}: QuotationsTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteMutation = useDeleteQuotation();
  const { t, language } = useTranslation();

  const todayStr = new Date().toISOString().slice(0, 10);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {Array.from({ length: 7 }).map((_, i) => (
                <TableHead key={i}>
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                </TableHead>
              ))}
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

  if (quotations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-border">
        <div className="rounded-full bg-muted p-4 mb-4">
          <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">
          {t("quotation.emptyTitle")}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t("quotation.emptyDescription")}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("quotation.quotationNumber")}
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("quotation.customer")}
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("quotation.quotationDate")}
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("quotation.expiryDate")}
              </TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("quotation.netAmount")}
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
            {quotations.map((quotation) => {
              const config = getQuotationStatusConfig(quotation.status);
              const isPastExpiry =
                normalizeQuotationStatus(quotation.status) === QuotationStatus.Sent &&
                quotation.expiryDate.slice(0, 10) < todayStr;

              return (
                <TableRow
                  key={quotation.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="px-4 py-3 text-sm font-medium font-mono text-xs">
                    <Link
                      href={`/sales/quotations/${quotation.id}`}
                      className="hover:underline"
                    >
                      {quotation.quotationNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    {quotation.customerName}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(quotation.quotationDate, language)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    <span
                      className={
                        isPastExpiry ? "text-destructive" : "text-muted-foreground"
                      }
                    >
                      {formatDate(quotation.expiryDate, language)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm tabular-nums">
                    {formatCurrency(quotation.netAmount, language)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    <Badge variant={config.badgeVariant}>
                      {t(config.labelKey)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-end">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/sales/quotations/${quotation.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label={t("common.view")}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      {normalizeQuotationStatus(quotation.status) === QuotationStatus.Draft && (
                        <>
                          <Link href={`/sales/quotations/${quotation.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => setDeleteId(quotation.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
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
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t("quotation.confirm.delete.title")}
        description={t("quotation.confirm.delete.description")}
        confirmLabel={t("common.delete")}
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
          setDeleteId(null);
        }}
      />
    </>
  );
}
