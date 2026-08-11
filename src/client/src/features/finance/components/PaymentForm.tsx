"use client";

import { useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, Wallet } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Input,
  Button,
  Select,
  Textarea,
  Alert,
} from "@/components/ui";
import {
  createPaymentFormSchemaWithRemaining,
  type CreatePaymentFormData,
} from "../schemas/payment.schema";
import { useRecordPayment } from "../hooks/usePayments";
import { useInvoice } from "../hooks/useInvoices";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import type { PaymentMethod } from "../types/payment.types";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";
import { useTranslation } from "@/hooks/use-translation";

const paymentMethodOptionKeys: { value: PaymentMethod; labelKey: string }[] = [
  { value: "Cash", labelKey: "finance.paymentMethods.cash" },
  { value: "BankTransfer", labelKey: "finance.paymentMethods.bankTransfer" },
  { value: "Card", labelKey: "finance.paymentMethods.card" },
  { value: "Cheque", labelKey: "finance.paymentMethods.cheque" },
];

function todayString(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

function formatCurrency(value: number): string {
  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ر.س`;
}

interface PaymentFormProps {
  invoiceId: string;
}

export default function PaymentForm({ invoiceId }: PaymentFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const recordMutation = useRecordPayment();
  const { data: invoice, isLoading: invoiceLoading } = useInvoice(invoiceId);

  const isPending = recordMutation.isPending;
  const error = recordMutation.error;
  const remainingAmount = invoice?.remainingAmount ?? 0;
  const canRecord =
    invoice?.status === "Issued" || invoice?.status === "PartiallyPaid";

  const paymentMethodOptions = paymentMethodOptionKeys.map((opt) => ({
    value: opt.value,
    label: t(opt.labelKey),
  }));

  const resolver = useMemo(
    () =>
      zodResolver(
        createPaymentFormSchemaWithRemaining(() => invoice?.remainingAmount)
      ) as Resolver<CreatePaymentFormData>,
    [invoice?.remainingAmount]
  );

  const form = useForm<CreatePaymentFormData>({
    resolver,
    defaultValues: {
      amount: undefined as unknown as number,
      paymentMethod: "Cash",
      paymentDate: todayString(),
      reference: "",
      notes: "",
    },
  });

  const getErrorMessage = (): string | null => {
    if (!error) return null;
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    return axiosError.response?.data?.message || error.message;
  };

  const onSubmit = async (data: CreatePaymentFormData) => {
    try {
      await recordMutation.mutateAsync({
        invoiceId,
        data: {
          amount: Number(data.amount),
          paymentMethod: data.paymentMethod,
          paymentDate: data.paymentDate,
          reference: data.reference || undefined,
          notes: data.notes || undefined,
        },
      });
      router.push(`/finance/invoices/${invoiceId}`);
    } catch {
      // Error handled via mutation state
    }
  };

  if (invoiceLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-border">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Wallet className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">{t("finance.invoices.notFound")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("finance.invoices.notFoundDescription")}
        </p>
      </div>
    );
  }

  return (
    <>
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("finance.payments.summaryTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <Label className="text-xs text-muted-foreground">{t("finance.invoices.invoiceNumber")}</Label>
              <div className="mt-1 text-sm font-medium font-mono">
                {invoice.invoiceNumber}
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{t("finance.invoices.customer")}</Label>
              <div className="mt-1 text-sm font-medium">
                {invoice.customerName}
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{t("finance.invoices.netAmount")}</Label>
              <div className="mt-1 text-sm font-medium">
                {formatCurrency(invoice.netAmount)}
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{t("finance.invoices.paid")}</Label>
              <div className="mt-1 text-sm font-medium text-emerald-600">
                {formatCurrency(invoice.paidAmount)}
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{t("finance.payments.remaining")}</Label>
              <div
                className={
                  remainingAmount > 0
                    ? "mt-1 text-sm font-semibold text-amber-600"
                    : "mt-1 text-sm font-medium"
                }
              >
                {formatCurrency(remainingAmount)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("finance.payments.recordTitle")}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {t("finance.payments.statusLabel")}
            <InvoiceStatusBadge status={invoice.status} />
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <p>{getErrorMessage()}</p>
            </Alert>
          )}

          {!canRecord && (
            <Alert variant="destructive" className="mb-6">
              <p>{t("finance.payments.blockedAlert")}</p>
            </Alert>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">{t("finance.payments.amountLabel")} *</Label>
              <Input
                id="amount"
                type="number"
                min={0}
                max={remainingAmount}
                step={0.01}
                placeholder="0.00"
                {...form.register("amount")}
                className="h-10"
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">{t("finance.payments.methodLabel")} *</Label>
                <Select
                  id="paymentMethod"
                  {...form.register("paymentMethod")}
                  options={paymentMethodOptions}
                  placeholder={t("finance.payments.selectMethod")}
                  className="h-10"
                />
                {form.formState.errors.paymentMethod && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.paymentMethod.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentDate">{t("finance.payments.dateLabel")} *</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  {...form.register("paymentDate")}
                  className="h-10"
                />
                {form.formState.errors.paymentDate && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.paymentDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">{t("finance.payments.referenceLabel")}</Label>
              <Input
                id="reference"
                placeholder={t("finance.payments.referencePlaceholder")}
                {...form.register("reference")}
                className="h-10"
              />
              {form.formState.errors.reference && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.reference.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t("finance.payments.notesLabel")}</Label>
              <Textarea
                id="notes"
                placeholder={t("finance.payments.notesPlaceholder")}
                {...form.register("notes")}
                rows={3}
              />
              {form.formState.errors.notes && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.notes.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <Button type="submit" disabled={isPending || !canRecord}>
                {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                {t("finance.payments.submit")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                <ArrowRight className="ml-2 h-4 w-4" />
                {t("finance.payments.back")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
