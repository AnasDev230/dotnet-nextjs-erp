"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Loader2,
  Send,
  XCircle,
  Wallet,
  AlertCircle,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Alert,
} from "@/components/ui";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import PaymentsList from "./PaymentsList";
import { useInvoice, useIssueInvoice, useCancelInvoice } from "../hooks/useInvoices";
import { useSalesOrder } from "@/features/sales/hooks/useSalesOrder";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";

function formatCurrency(value: number): string {
  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ر.س`;
}

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("ar-SA");
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

export default function InvoiceDetails({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const [cancelOpen, setCancelOpen] = useState(false);

  const { data: invoice, isLoading, error } = useInvoice(invoiceId);
  const { data: order } = useSalesOrder(invoice?.orderId || undefined);
  const issueMutation = useIssueInvoice();
  const cancelMutation = useCancelInvoice();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !invoice) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">الفاتورة غير موجودة</h1>
            <p className="text-muted-foreground text-sm">
              لم يتم العثور على الفاتورة المطلوبة
            </p>
          </div>
        </div>
        {axiosError?.response?.data?.message && (
          <Alert variant="destructive">
            <p>{axiosError.response.data.message}</p>
          </Alert>
        )}
      </div>
    );
  }

  const canRecordPayment =
    invoice.status === "Issued" || invoice.status === "PartiallyPaid";
  const canCancel =
    invoice.status !== "Paid" &&
    invoice.status !== "Cancelled" &&
    invoice.status !== "Draft";
  const canIssue = invoice.status === "Draft";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              الفاتورة {invoice.invoiceNumber}
            </h1>
            <p className="text-muted-foreground text-sm">تفاصيل الفاتورة</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canIssue && (
            <Button
              disabled={issueMutation.isPending}
              onClick={() => issueMutation.mutate(invoice.id)}
            >
              {issueMutation.isPending && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              )}
              <Send className="ml-2 h-4 w-4" />
              إصدار الفاتورة
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outline"
              className="text-destructive"
              onClick={() => setCancelOpen(true)}
            >
              <XCircle className="ml-2 h-4 w-4" />
              إلغاء الفاتورة
            </Button>
          )}
          {canRecordPayment && (
            <Link href={`/finance/invoices/${invoice.id}/payments/new`}>
              <Button>
                <Wallet className="ml-2 h-4 w-4" />
                تسجيل دفعة
              </Button>
            </Link>
          )}
          {invoice.orderId && (
            <Link href={`/sales/orders/${invoice.orderId}`}>
              <Button variant="outline">أمر البيع</Button>
            </Link>
          )}
        </div>
      </div>

      {canRecordPayment && invoice.isOverdue && (
        <Alert className="border-red-500/20 bg-red-500/10 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <p>هذه الفاتورة متأخرة عن تاريخ الاستحقاق.</p>
        </Alert>
      )}

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">بيانات الفاتورة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoRow
              label="رقم الفاتورة"
              value={
                <span className="font-mono">{invoice.invoiceNumber}</span>
              }
            />
            <InfoRow
              label="أمر البيع"
              value={
                <span className="font-mono">{invoice.orderNumber}</span>
              }
            />
            <InfoRow label="العميل" value={invoice.customerName} />
            <InfoRow label="تاريخ الإصدار" value={formatDate(invoice.issueDate)} />
            <InfoRow
              label="تاريخ الاستحقاق"
              value={
                invoice.dueDate ? (
                  <span
                    className={
                      invoice.isOverdue
                        ? "flex items-center gap-1 font-medium text-destructive"
                        : undefined
                    }
                  >
                    {formatDate(invoice.dueDate)}
                    {invoice.isOverdue && (
                      <AlertCircle className="h-3.5 w-3.5" />
                    )}
                  </span>
                ) : (
                  "—"
                )
              }
            />
            <InfoRow
              label="الحالة"
              value={<InvoiceStatusBadge status={invoice.status} />}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">الملخص المالي</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border p-4">
              <Label className="text-xs text-muted-foreground">
                المجموع الفرعي
              </Label>
              <div className="mt-1 text-base font-semibold">
                {formatCurrency(invoice.subtotal)}
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <Label className="text-xs text-muted-foreground">الخصم</Label>
              <div className="mt-1 text-base font-semibold text-destructive">
                {invoice.discountAmount > 0
                  ? `-${formatCurrency(invoice.discountAmount)}`
                  : formatCurrency(invoice.discountAmount)}
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <Label className="text-xs text-muted-foreground">الضريبة</Label>
              <div className="mt-1 text-base font-semibold">
                {invoice.taxAmount > 0
                  ? `+${formatCurrency(invoice.taxAmount)}`
                  : formatCurrency(invoice.taxAmount)}
              </div>
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <Label className="text-xs text-muted-foreground">صافي المبلغ</Label>
              <div className="mt-1 text-base font-semibold text-primary">
                {formatCurrency(invoice.netAmount)}
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <Label className="text-xs text-muted-foreground">المدفوع</Label>
              <div className="mt-1 text-base font-semibold text-emerald-600">
                {formatCurrency(invoice.paidAmount)}
              </div>
            </div>
            <div
              className={
                invoice.remainingAmount > 0
                  ? "rounded-lg border border-amber-500/20 bg-amber-500/5 p-4"
                  : "rounded-lg border border-border p-4"
              }
            >
              <Label className="text-xs text-muted-foreground">
                المبلغ المتبقي
              </Label>
              <div
                className={
                  invoice.remainingAmount > 0
                    ? "mt-1 text-base font-semibold text-amber-600"
                    : "mt-1 text-base font-semibold"
                }
              >
                {formatCurrency(invoice.remainingAmount)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">منتجات الفاتورة</CardTitle>
        </CardHeader>
        <CardContent>
          {!order ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المنتج</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>سعر الوحدة</TableHead>
                    <TableHead className="text-left">الإجمالي</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {item.productSku}
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-left font-medium">
                        {formatCurrency(item.lineTotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-end">
                <div className="w-full max-w-xs space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      عدد المنتجات
                    </span>
                    <span>{order.items.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>المجموع الفرعي</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      الخصم
                      {order.discountPct > 0 && (
                        <span className="text-muted-foreground">
                          {" "}
                          ({order.discountPct}%)
                        </span>
                      )}
                    </span>
                    <span className="text-destructive">
                      {order.discountAmount > 0
                        ? `-${formatCurrency(order.discountAmount)}`
                        : formatCurrency(order.discountAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      الضريبة
                      {order.taxRateName && order.taxPct > 0 && (
                        <span className="text-muted-foreground">
                          {" "}
                          ({order.taxRateName} {order.taxPct}%)
                        </span>
                      )}
                    </span>
                    <span>
                      {order.taxAmount > 0
                        ? `+${formatCurrency(order.taxAmount)}`
                        : formatCurrency(order.taxAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-2 text-base font-semibold">
                    <span>الإجمالي النهائي</span>
                    <span className="text-primary">
                      {formatCurrency(order.netAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">الدفعات</CardTitle>
            {canRecordPayment && (
              <Link href={`/finance/invoices/${invoice.id}/payments/new`}>
                <Button size="sm" variant="outline">
                  <Wallet className="ml-2 h-4 w-4" />
                  تسجيل دفعة
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <PaymentsList
            invoiceId={invoice.id}
            canDelete={invoice.status !== "Paid"}
          />
        </CardContent>
      </Card>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إلغاء الفاتورة</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من إلغاء هذه الفاتورة؟
              <br />
              <span className="text-amber-600 font-medium">
                لا يمكن إلغاء الفواتير المدفوعة بالكامل أو التي عليها دفعات.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              تراجع
            </Button>
            <Button
              variant="destructive"
              disabled={cancelMutation.isPending}
              onClick={() => {
                cancelMutation.mutate(invoice.id, {
                  onSuccess: () => setCancelOpen(false),
                });
              }}
            >
              {cancelMutation.isPending && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              )}
              تأكيد الإلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
