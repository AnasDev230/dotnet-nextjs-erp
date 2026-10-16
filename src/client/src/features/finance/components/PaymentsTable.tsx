"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Trash2, Wallet } from "lucide-react";
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
import { useDeletePayment } from "../hooks/usePayments";
import { useTranslation } from "@/hooks/use-translation";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { PaymentList, PaymentMethod } from "../types/payment.types";

const paymentMethodLabelKeys: Record<PaymentMethod, string> = {
  Cash: "finance.paymentMethods.cash",
  BankTransfer: "finance.paymentMethods.bankTransfer",
  Card: "finance.paymentMethods.card",
  Cheque: "finance.paymentMethods.cheque",
};

interface PaymentsTableProps {
  payments: PaymentList[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function PaymentsTable({
  payments,
  isLoading,
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
}: PaymentsTableProps) {
  const { t, language } = useTranslation();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const deleteMutation = useDeletePayment();

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

  const headClass =
    "h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider";

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={headClass}>
                {t("finance.invoices.invoiceNumber")}
              </TableHead>
              <TableHead className={headClass}>
                {t("finance.invoices.customer")}
              </TableHead>
              <TableHead className={headClass}>
                {t("finance.payments.date")}
              </TableHead>
              <TableHead className={headClass}>
                {t("finance.payments.amount")}
              </TableHead>
              <TableHead className={headClass}>
                {t("finance.payments.method")}
              </TableHead>
              <TableHead className={headClass}>
                {t("finance.payments.reference")}
              </TableHead>
              <TableHead className={`${headClass} text-end`}>
                {t("common.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 7 }).map((_, j) => (
                  <TableCell key={j} className="px-4 py-3">
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

  if (payments.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-border">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Wallet className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">
            {t("finance.payments.emptyTitle")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("finance.payments.emptyListDescription")}
          </p>
        </div>
        {deleteId !== null && (
          <ConfirmDialog
            open={deleteId !== null}
            onOpenChange={(open) => {
              if (!open) {
                setDeleteId(null);
                setErrorMessage(null);
              }
            }}
            title={t("finance.payments.deleteTitle")}
            description={t("finance.payments.deleteDescription")}
            confirmLabel={t("common.delete")}
            variant="danger"
            isLoading={deleteMutation.isPending}
            errorMessage={errorMessage}
            onConfirm={handleDelete}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={headClass}>
                {t("finance.invoices.invoiceNumber")}
              </TableHead>
              <TableHead className={headClass}>
                {t("finance.invoices.customer")}
              </TableHead>
              <TableHead className={headClass}>
                {t("finance.payments.date")}
              </TableHead>
              <TableHead className={headClass}>
                {t("finance.payments.amount")}
              </TableHead>
              <TableHead className={headClass}>
                {t("finance.payments.method")}
              </TableHead>
              <TableHead className={headClass}>
                {t("finance.payments.reference")}
              </TableHead>
              <TableHead className={`${headClass} text-end`}>
                {t("common.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow
                key={payment.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <TableCell className="px-4 py-3 text-sm font-mono text-xs">
                  <Link
                    href={`/finance/invoices/${payment.invoiceId}`}
                    className="hover:underline"
                  >
                    {payment.invoiceNumber}
                  </Link>
                </TableCell>
                <TableCell className="px-4 py-3 text-sm">
                  {payment.customerName}
                </TableCell>
                <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                  {formatDate(payment.paymentDate, language)}
                </TableCell>
                <TableCell className="px-4 py-3 text-sm font-medium tabular-nums">
                  {formatCurrency(payment.amount, language)}
                </TableCell>
                <TableCell className="px-4 py-3 text-sm">
                  {t(paymentMethodLabelKeys[payment.paymentMethod])}
                </TableCell>
                <TableCell className="px-4 py-3 text-sm text-muted-foreground font-mono text-xs">
                  {payment.reference || "—"}
                </TableCell>
                <TableCell className="px-4 py-3 text-end">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/finance/invoices/${payment.invoiceId}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => {
                        setErrorMessage(null);
                        setDeleteId(payment.id);
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
        title={t("finance.payments.deleteTitle")}
        description={t("finance.payments.deleteDescription")}
        confirmLabel={t("common.delete")}
        variant="danger"
        isLoading={deleteMutation.isPending}
        errorMessage={errorMessage}
        onConfirm={handleDelete}
      />
    </>
  );
}
