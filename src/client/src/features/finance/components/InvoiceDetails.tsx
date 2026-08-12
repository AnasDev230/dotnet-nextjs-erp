"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, Send, XCircle, Wallet, AlertCircle } from "lucide-react";
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
  Alert,
} from "@/components/ui";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import PaymentsList from "./PaymentsList";
import { useInvoice, useIssueInvoice, useCancelInvoice } from "../hooks/useInvoices";
import { useSalesOrder } from "@/features/sales/hooks/useSalesOrder";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";
import { useTranslation } from "@/hooks/use-translation";
import { formatCurrency, formatDate } from "@/lib/formatters";

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
  const { t, language } = useTranslation();
  const [confirmAction, setConfirmAction] = useState<"issue" | "cancel" | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: invoice, isLoading, error } = useInvoice(invoiceId);
  const { data: order } = useSalesOrder(invoice?.orderId || undefined);
  const issueMutation = useIssueInvoice();
  const cancelMutation = useCancelInvoice();

  const isLoadingAction =
    issueMutation.isPending || cancelMutation.isPending;

  const closeConfirm = () => {
    setConfirmAction(null);
    setErrorMessage(null);
  };

  const handleConfirm = () => {
    if (confirmAction === "issue") {
      issueMutation.mutate(invoiceId, {
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
      cancelMutation.mutate(invoiceId, {
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
            <h1 className="text-2xl font-semibold">{t("finance.invoices.notFound")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("finance.invoices.notFoundDescription")}
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
              {t("finance.invoices.invoiceLabel")} {invoice.invoiceNumber}
            </h1>
            <p className="text-muted-foreground text-sm">{t("finance.invoices.detailsSubtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canIssue && (
            <Button
              disabled={isLoadingAction}
              onClick={() => {
                setErrorMessage(null);
                setConfirmAction("issue");
              }}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {t("finance.invoices.issueButton")}
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outline"
              className="gap-2 text-destructive"
              disabled={isLoadingAction}
              onClick={() => {
                setErrorMessage(null);
                setConfirmAction("cancel");
              }}
            >
              <XCircle className="h-4 w-4" />
              {t("finance.invoices.cancelButton")}
            </Button>
          )}
          {canRecordPayment && (
            <Link href={`/finance/invoices/${invoice.id}/payments/new`}>
              <Button className="gap-2">
                <Wallet className="h-4 w-4" />
                {t("finance.invoices.recordPayment")}
              </Button>
            </Link>
          )}
          {invoice.orderId && (
            <Link href={`/sales/orders/${invoice.orderId}`}>
              <Button variant="outline">{t("finance.invoices.viewOrder")}</Button>
            </Link>
          )}
        </div>
      </div>

      {canRecordPayment && invoice.isOverdue && (
        <Alert className="border-red-500/20 bg-red-500/10 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <p>{t("finance.invoices.overdueAlert")}</p>
        </Alert>
      )}

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("finance.invoices.dataCard")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoRow
              label={t("finance.invoices.invoiceNumber")}
              value={
                <span className="font-mono">{invoice.invoiceNumber}</span>
              }
            />
            <InfoRow
              label={t("finance.invoices.salesOrder")}
              value={
                <span className="font-mono">{invoice.orderNumber}</span>
              }
            />
            <InfoRow label={t("finance.invoices.customer")} value={invoice.customerName} />
            <InfoRow label={t("finance.invoices.issueDate")} value={formatDate(invoice.issueDate, language)} />
            <InfoRow
              label={t("finance.invoices.dueDate")}
              value={
                invoice.dueDate ? (
                  <span
                    className={
                      invoice.isOverdue
                        ? "flex items-center gap-1 font-medium text-destructive"
                        : undefined
                    }
                  >
                    {formatDate(invoice.dueDate, language)}
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
              label={t("common.status")}
              value={<InvoiceStatusBadge status={invoice.status} />}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("finance.invoices.financialSummary")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border p-4">
              <Label className="text-xs text-muted-foreground">
                {t("finance.invoices.subtotal")}
              </Label>
              <div className="mt-1 text-base font-semibold">
                {formatCurrency(invoice.subtotal, language)}
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <Label className="text-xs text-muted-foreground">{t("finance.invoices.discount")}</Label>
              <div className="mt-1 text-base font-semibold text-destructive">
                {invoice.discountAmount > 0
                  ? `-${formatCurrency(invoice.discountAmount, language)}`
                  : formatCurrency(invoice.discountAmount, language)}
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <Label className="text-xs text-muted-foreground">{t("finance.invoices.tax")}</Label>
              <div className="mt-1 text-base font-semibold">
                {invoice.taxAmount > 0
                  ? `+${formatCurrency(invoice.taxAmount, language)}`
                  : formatCurrency(invoice.taxAmount, language)}
              </div>
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <Label className="text-xs text-muted-foreground">{t("finance.invoices.netAmount")}</Label>
              <div className="mt-1 text-base font-semibold text-primary">
                {formatCurrency(invoice.netAmount, language)}
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <Label className="text-xs text-muted-foreground">{t("finance.invoices.paid")}</Label>
              <div className="mt-1 text-base font-semibold text-emerald-600">
                {formatCurrency(invoice.paidAmount, language)}
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
                {t("finance.invoices.remainingAmount")}
              </Label>
              <div
                className={
                  invoice.remainingAmount > 0
                    ? "mt-1 text-base font-semibold text-amber-600"
                    : "mt-1 text-base font-semibold"
                }
              >
                {formatCurrency(invoice.remainingAmount, language)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("finance.invoices.productsCard")}</CardTitle>
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
                  <TableRow className="hover:bg-transparent">
                    <TableHead>{t("finance.invoices.product")}</TableHead>
                    <TableHead>{t("finance.invoices.quantity")}</TableHead>
                    <TableHead>{t("finance.invoices.unitPrice")}</TableHead>
                    <TableHead className="text-end">{t("finance.invoices.total")}</TableHead>
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
                      <TableCell className="tabular-nums">{item.quantity}</TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">
                        {formatCurrency(item.unitPrice, language)}
                      </TableCell>
                      <TableCell className="text-end font-medium tabular-nums">
                        {formatCurrency(item.lineTotal, language)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-end">
                <div className="w-full max-w-xs space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("finance.invoices.itemsCount")}
                    </span>
                    <span>{order.items.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>{t("finance.invoices.subtotal")}</span>
                    <span>{formatCurrency(order.subtotal, language)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {t("finance.invoices.discount")}
                      {order.discountPct > 0 && (
                        <span className="text-muted-foreground">
                          {" "}
                          ({order.discountPct}%)
                        </span>
                      )}
                    </span>
                    <span className="text-destructive">
                      {order.discountAmount > 0
                        ? `-${formatCurrency(order.discountAmount, language)}`
                        : formatCurrency(order.discountAmount, language)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {t("finance.invoices.tax")}
                      {order.taxRateName && order.taxPct > 0 && (
                        <span className="text-muted-foreground">
                          {" "}
                          ({order.taxRateName} {order.taxPct}%)
                        </span>
                      )}
                    </span>
                    <span>
                      {order.taxAmount > 0
                        ? `+${formatCurrency(order.taxAmount, language)}`
                        : formatCurrency(order.taxAmount, language)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-2 text-base font-semibold">
                    <span>{t("finance.invoices.finalTotal")}</span>
                    <span className="text-primary">
                      {formatCurrency(order.netAmount, language)}
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
            <CardTitle className="text-lg">{t("finance.invoices.paymentsCard")}</CardTitle>
            {canRecordPayment && (
              <Link href={`/finance/invoices/${invoice.id}/payments/new`}>
                <Button size="sm" variant="outline" className="gap-2">
                  <Wallet className="h-4 w-4" />
                  {t("finance.invoices.recordPayment")}
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

      <ConfirmDialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && closeConfirm()}
        title={
          confirmAction === "issue"
            ? t("finance.invoices.issueTitle")
            : t("finance.invoices.cancelTitle")
        }
        description={
          confirmAction === "issue"
            ? t("finance.invoices.issueDescription")
            : t("finance.invoices.cancelDescription")
        }
        confirmLabel={
          confirmAction === "issue"
            ? t("finance.invoices.issueConfirmLabel")
            : t("finance.invoices.cancelConfirmLabel")
        }
        variant={confirmAction === "issue" ? "info" : "danger"}
        isLoading={isLoadingAction}
        errorMessage={errorMessage}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
