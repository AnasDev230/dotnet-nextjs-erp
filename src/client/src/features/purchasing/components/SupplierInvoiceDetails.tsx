"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Banknote } from "lucide-react";
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
import { SupplierInvoiceStatusBadge } from "./SupplierInvoiceStatusBadge";
import { PaymentMethodBadge } from "./PaymentMethodBadge";
import { SupplierInvoiceStatusActions } from "./SupplierInvoiceStatusActions";
import { PurchasePaymentDialog } from "./PurchasePaymentDialog";
import { useSupplierInvoice } from "../hooks/useSupplierInvoice";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { useTranslation } from "@/hooks/use-translation";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

export default function SupplierInvoiceDetails({
  invoiceId,
}: {
  invoiceId: string;
}) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { data: invoice, isLoading, error } = useSupplierInvoice(invoiceId);
  const [paymentOpen, setPaymentOpen] = useState(false);

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
            <h1 className="text-2xl font-semibold">{t("supplierInvoice.notFound")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("supplierInvoice.notFoundDescription")}
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              <span className="font-mono">{invoice.invoiceNumber}</span>
            </h1>
            <p className="text-muted-foreground text-sm">{t("supplierInvoice.details")}</p>
          </div>
        </div>
        <SupplierInvoiceStatusBadge status={invoice.status} />
      </div>

      <SupplierInvoiceStatusActions
        invoiceId={invoice.id}
        status={invoice.status}
        onNewPayment={() => setPaymentOpen(true)}
      />

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("supplierInvoice.info")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoRow label={t("supplierInvoice.supplier")} value={invoice.supplierName} />
            <InfoRow
              label={t("supplierInvoice.purchaseOrder")}
              value={<span className="font-mono">{invoice.purchaseOrderNumber}</span>}
            />
            <InfoRow label={t("supplierInvoice.issueDate")} value={formatDate(invoice.issueDate, language)} />
            <InfoRow label={t("supplierInvoice.dueDate")} value={formatDate(invoice.dueDate, language)} />
            <InfoRow label={t("supplierInvoice.subtotal")} value={formatCurrency(invoice.subtotal, language)} />
            <InfoRow label={t("supplierInvoice.taxAmount")} value={formatCurrency(invoice.taxAmount, language)} />
            <InfoRow label={t("supplierInvoice.netAmount")} value={formatCurrency(invoice.netAmount, language)} />
            <InfoRow
              label={t("supplierInvoice.paidAmount")}
              value={
                <span className="text-emerald-600">
                  {formatCurrency(invoice.paidAmount, language)}
                </span>
              }
            />
            <InfoRow
              label={t("supplierInvoice.remainingAmount")}
              value={
                <span className="text-amber-600">
                  {formatCurrency(invoice.remainingAmount, language)}
                </span>
              }
            />
            {invoice.supplierReference && (
              <InfoRow label={t("supplierInvoice.supplierReference")} value={invoice.supplierReference} />
            )}
            {invoice.notes && (
              <InfoRow label={t("supplierInvoice.notes")} value={invoice.notes} />
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{t("supplierInvoice.payments")}</CardTitle>
            {(invoice.status === "Received" || invoice.status === "PartiallyPaid") && (
              <Button onClick={() => setPaymentOpen(true)} className="gap-2" size="sm">
                <Banknote className="h-4 w-4" />
                {t("supplierInvoice.newPayment")}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {invoice.payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Banknote className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("supplierInvoice.noPayments")}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>{t("purchasePayment.paymentDate")}</TableHead>
                  <TableHead className="text-end">{t("purchasePayment.amount")}</TableHead>
                  <TableHead>{t("purchasePayment.method")}</TableHead>
                  <TableHead>{t("purchasePayment.reference")}</TableHead>
                  {invoice.payments.some((p) => p.notes) && (
                    <TableHead>{t("purchasePayment.notes")}</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.payments.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDate(payment.paymentDate, language)}
                    </TableCell>
                    <TableCell className="text-end font-mono text-xs tabular-nums">
                      {formatCurrency(payment.amount, language)}
                    </TableCell>
                    <TableCell>
                      <PaymentMethodBadge method={payment.method} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {payment.reference || "—"}
                    </TableCell>
                    {invoice.payments.some((p) => p.notes) && (
                      <TableCell className="text-muted-foreground text-xs">
                        {payment.notes || "—"}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PurchasePaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        invoice={invoice}
      />
    </div>
  );
}