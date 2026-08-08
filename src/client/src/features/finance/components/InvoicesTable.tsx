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
              "حدث خطأ غير متوقع"
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
              "حدث خطأ غير متوقع"
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
              "حدث خطأ غير متوقع"
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
              <TableHead>رقم الفاتورة</TableHead>
              <TableHead>رقم الأمر</TableHead>
              <TableHead>العميل</TableHead>
              <TableHead>تاريخ الإصدار</TableHead>
              <TableHead>تاريخ الاستحقاق</TableHead>
              <TableHead>صافي المبلغ</TableHead>
              <TableHead>المدفوع</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
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
        <h3 className="text-lg font-semibold mb-1">لا توجد فواتير</h3>
        <p className="text-sm text-muted-foreground mb-4">
          لم يتم إنشاء أي فواتير بعد
        </p>
        <Link href="/finance/invoices/new">
          <Button>
            <FileText className="ml-2 h-4 w-4" />
            فاتورة جديدة
          </Button>
        </Link>
      </div>
    );
  }

  const confirmConfig = {
    delete: {
      open: confirmAction === "delete",
      title: "حذف الفاتورة",
      description:
        "هل أنت متأكد من حذف هذه الفاتورة؟ لا يمكن حذف الفواتير بعد إصدارها. لا يمكن التراجع عن هذا الإجراء.",
      confirmLabel: "حذف",
      variant: "danger" as const,
    },
    issue: {
      open: confirmAction === "issue",
      title: "إصدار الفاتورة",
      description:
        "هل أنت متأكد من إصدار هذه الفاتورة؟ سيصبح من غير الممكن تعديلها أو حذفها بعد الإصدار.",
      confirmLabel: "إصدار",
      variant: "info" as const,
    },
    cancel: {
      open: confirmAction === "cancel",
      title: "إلغاء الفاتورة",
      description:
        "هل أنت متأكد من إلغاء هذه الفاتورة؟ لا يمكن إلغاء الفواتير المدفوعة بالكامل أو التي عليها دفعات.",
      confirmLabel: "إلغاء",
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
              <TableHead>رقم الفاتورة</TableHead>
              <TableHead>رقم الأمر</TableHead>
              <TableHead>العميل</TableHead>
              <TableHead>تاريخ الإصدار</TableHead>
              <TableHead>تاريخ الاستحقاق</TableHead>
              <TableHead>صافي المبلغ</TableHead>
              <TableHead>المدفوع</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
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
                        title="إصدار الفاتورة"
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
                          title="إلغاء الفاتورة"
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
            عرض {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, totalCount)} من {totalCount}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              السابق
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              التالي
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
