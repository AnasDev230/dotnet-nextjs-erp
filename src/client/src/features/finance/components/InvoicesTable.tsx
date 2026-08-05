"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  Trash2,
  Send,
  XCircle,
  FileText,
  Loader2,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { useIssueInvoice } from "../hooks/useInvoices";
import { useCancelInvoice } from "../hooks/useInvoices";
import { useDeleteInvoice } from "../hooks/useInvoices";
import type { InvoiceListItem } from "../types/invoice.types";

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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const issueMutation = useIssueInvoice();
  const cancelMutation = useCancelInvoice();
  const deleteMutation = useDeleteInvoice();

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
                        disabled={issueMutation.isPending}
                        onClick={() => issueMutation.mutate(invoice.id)}
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
                          disabled={cancelMutation.isPending}
                          onClick={() => cancelMutation.mutate(invoice.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    {invoice.status === "Draft" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDeleteId(invoice.id)}
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

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف الفاتورة؟
              <br />
              <span className="text-amber-600 font-medium">
                لا يمكن حذف الفواتير بعد إصدارها.
              </span>{" "}
              لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              إلغاء
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deleteId) {
                  deleteMutation.mutate(deleteId, {
                    onSuccess: () => setDeleteId(null),
                  });
                }
              }}
            >
              {deleteMutation.isPending && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              )}
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
