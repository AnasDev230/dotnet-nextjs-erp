"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  Trash2,
  Send,
  XCircle,
  FileText,
  AlertCircle,
} from "lucide-react";
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
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { useIssueInvoice } from "../hooks/useInvoices";
import { useCancelInvoice } from "../hooks/useInvoices";
import { useDeleteInvoice } from "../hooks/useInvoices";
import { useTranslation } from "@/hooks/use-translation";
import type { InvoiceListItem } from "../types/invoice.types";

type ConfirmAction = "delete" | "issue" | "cancel" | null;

function formatCurrency(value: number): string {
  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ر.س`;
}

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("ar-SA");
}

interface InvoicesTableProps {
  invoices: InvoiceListItem[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function InvoicesTable({
  invoices,
  isLoading,
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
}: InvoicesTableProps) {
  const { t } = useTranslation();
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const issueMutation = useIssueInvoice();
  const cancelMutation = useCancelInvoice();
  const deleteMutation = useDeleteInvoice();

  const isLoadingAction =
    issueMutation.isPending ||
    cancelMutation.isPending ||
    deleteMutation.isPending;

  const openConfirm = (action: Exclude<ConfirmAction, null>, id: string) => {
    setErrorMessage(null);
    setSelectedInvoiceId(id);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    setConfirmAction(null);
    setSelectedInvoiceId(null);
    setErrorMessage(null);
  };

  const handleConfirm = () => {
    if (!selectedInvoiceId) return;
    if (confirmAction === "delete") {
      deleteMutation.mutate(selectedInvoiceId, {
        onSuccess: closeConfirm,
        onError: (error: any) => {
          setErrorMessage(
            error?.response?.data?.message ||
              error?.message ||
              t("common.unexpectedError")
          );
        },
      });
    } else if (confirmAction === "issue") {
      issueMutation.mutate(selectedInvoiceId, {
        onSuccess: closeConfirm,
        onError: (error: any) => {
          setErrorMessage(
            error?.response?.data?.message ||
              error?.message ||
              t("common.unexpectedError")
          );
        },
      });
    } else if (confirmAction === "cancel") {
      cancelMutation.mutate(selectedInvoiceId, {
        onSuccess: closeConfirm,
        onError: (error: any) => {
          setErrorMessage(
            error?.response?.data?.message ||
              error?.message ||
              t("common.unexpectedError")
          );
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("finance.invoices.invoiceNumber")}</TableHead>
              <TableHead>{t("finance.invoices.orderNumber")}</TableHead>
              <TableHead>{t("finance.invoices.customer")}</TableHead>
              <TableHead>{t("finance.invoices.issueDate")}</TableHead>
              <TableHead>{t("finance.invoices.dueDate")}</TableHead>
              <TableHead>{t("finance.invoices.netAmount")}</TableHead>
              <TableHead>{t("finance.invoices.paid")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead className="text-left">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 9 }).map((_, j) => (
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

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-border">
        <div className="rounded-full bg-muted p-4 mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">{t("finance.invoices.emptyTitle")}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t("finance.invoices.emptyDescription")}
        </p>
        <Link href="/finance/invoices/new">
          <Button className="gap-2">
            <FileText className="h-4 w-4" />
            {t("finance.invoices.new")}
          </Button>
        </Link>
      </div>
    );
  }

  const confirmConfig = {
    delete: {
      open: confirmAction === "delete",
      title: t("finance.invoices.deleteTitle"),
      description: t("finance.invoices.deleteDescription"),
      confirmLabel: t("common.delete"),
      variant: "danger" as const,
    },
    issue: {
      open: confirmAction === "issue",
      title: t("finance.invoices.issueTitle"),
      description: t("finance.invoices.issueDescription"),
      confirmLabel: t("finance.invoices.issueConfirmLabel"),
      variant: "info" as const,
    },
    cancel: {
      open: confirmAction === "cancel",
      title: t("finance.invoices.cancelTitle"),
      description: t("finance.invoices.cancelDescription"),
      confirmLabel: t("finance.invoices.cancelConfirmLabel"),
      variant: "danger" as const,
    },
  };

  const activeConfig = confirmAction !== null ? confirmConfig[confirmAction] : null;

  return (
    <>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("finance.invoices.invoiceNumber")}</TableHead>
              <TableHead>{t("finance.invoices.orderNumber")}</TableHead>
              <TableHead>{t("finance.invoices.customer")}</TableHead>
              <TableHead>{t("finance.invoices.issueDate")}</TableHead>
              <TableHead>{t("finance.invoices.dueDate")}</TableHead>
              <TableHead>{t("finance.invoices.netAmount")}</TableHead>
              <TableHead>{t("finance.invoices.paid")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead className="text-left">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium font-mono text-xs">
                  {invoice.invoiceNumber}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {invoice.orderNumber}
                </TableCell>
                <TableCell>{invoice.customerName}</TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {formatDate(invoice.issueDate)}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  <span
                    className={
                      invoice.isOverdue
                        ? "flex items-center gap-1 font-medium text-destructive"
                        : undefined
                    }
                  >
                    {invoice.dueDate ? formatDate(invoice.dueDate) : "—"}
                    {invoice.isOverdue && (
                      <AlertCircle className="h-3.5 w-3.5" />
                    )}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatCurrency(invoice.netAmount)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatCurrency(invoice.paidAmount)}
                </TableCell>
                <TableCell>
                  <InvoiceStatusBadge status={invoice.status} />
                </TableCell>
                <TableCell className="text-left">
                  <div className="flex items-center gap-1">
                    <Link href={`/finance/invoices/${invoice.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    {invoice.status === "Draft" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title={t("finance.invoices.issueTitle")}
                        disabled={isLoadingAction}
                        onClick={() => openConfirm("issue", invoice.id)}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                    {invoice.status !== "Paid" &&
                      invoice.status !== "Draft" &&
                      invoice.status !== "Cancelled" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          title={t("finance.invoices.cancelTitle")}
                          disabled={isLoadingAction}
                          onClick={() => openConfirm("cancel", invoice.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    {invoice.status === "Draft" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => openConfirm("delete", invoice.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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

      {activeConfig && (
        <ConfirmDialog
          open={activeConfig.open}
          onOpenChange={(open) => !open && closeConfirm()}
          title={activeConfig.title}
          description={activeConfig.description}
          confirmLabel={activeConfig.confirmLabel}
          variant={activeConfig.variant}
          isLoading={isLoadingAction}
          errorMessage={errorMessage}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
