"use client";

import Link from "next/link";
import { FileText, AlertCircle } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import { InvoiceStatusBadge } from "@/features/finance/components/InvoiceStatusBadge";
import type { RecentInvoice } from "@/types/dashboard";

function formatCurrency(value: number): string {
  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ر.س`;
}

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("ar-SA");
}

interface RecentInvoicesTableProps {
  invoices: RecentInvoice[] | undefined;
  isLoading: boolean;
}

export default function RecentInvoicesTable({
  invoices,
  isLoading,
}: RecentInvoicesTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">أحدث الفواتير</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم الفاتورة</TableHead>
              <TableHead>العميل</TableHead>
              <TableHead>تاريخ الإصدار</TableHead>
              <TableHead>المبلغ</TableHead>
              <TableHead>المدفوع</TableHead>
              <TableHead>الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <TableCell key={j}>
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">أحدث الفواتير</CardTitle>
        </CardHeader>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="mb-3 rounded-full bg-muted p-3">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">لا توجد فواتير بعد</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">أحدث الفواتير</CardTitle>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>رقم الفاتورة</TableHead>
            <TableHead>العميل</TableHead>
            <TableHead>تاريخ الإصدار</TableHead>
            <TableHead>المبلغ</TableHead>
            <TableHead>المدفوع</TableHead>
            <TableHead>الحالة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>
                <Link
                  href={`/finance/invoices/${invoice.id}`}
                  className="font-mono text-xs font-medium text-primary hover:underline"
                >
                  {invoice.invoiceNumber}
                </Link>
              </TableCell>
              <TableCell>{invoice.customerName}</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                <span
                  className={
                    invoice.isOverdue
                      ? "flex items-center gap-1 font-medium text-destructive"
                      : undefined
                  }
                >
                  {formatDate(invoice.issueDate)}
                  {invoice.isOverdue && (
                    <span title="متأخرة">
                      <AlertCircle className="h-3.5 w-3.5" aria-label="متأخرة" />
                    </span>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
