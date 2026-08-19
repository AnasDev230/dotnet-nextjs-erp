"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, Input, Label, Select, Textarea } from "@/components/ui";
import {
  createPurchasePaymentSchema,
  type PurchasePaymentFormData,
} from "../schemas/purchase-payment.schema";
import { useCreatePurchasePayment } from "../hooks/useCreatePurchasePayment";
import { useTranslation } from "@/hooks/use-translation";
import { formatCurrency } from "@/lib/formatters";
import type { SupplierInvoiceResponse } from "../types/supplier-invoice.types";

const methodOptionKeys = [
  { value: "Cash", labelKey: "payment.method.cash" },
  { value: "BankTransfer", labelKey: "payment.method.bankTransfer" },
  { value: "Card", labelKey: "payment.method.card" },
  { value: "Cheque", labelKey: "payment.method.cheque" },
] as const;

function todayString(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

interface PurchasePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: SupplierInvoiceResponse;
}

export function PurchasePaymentDialog({
  open,
  onOpenChange,
  invoice,
}: PurchasePaymentDialogProps) {
  const { t, language } = useTranslation();
  const mutation = useCreatePurchasePayment();
  const remaining = invoice.netAmount - invoice.paidAmount;

  const form = useForm<PurchasePaymentFormData>({
    resolver: zodResolver(
      createPurchasePaymentSchema(remaining)
    ) as Resolver<PurchasePaymentFormData>,
    defaultValues: {
      amount: remaining,
      method: "",
      paymentDate: todayString(),
      reference: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        amount: remaining,
        method: "",
        paymentDate: todayString(),
        reference: "",
        notes: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, invoice.id]);

  const onSubmit = async (data: PurchasePaymentFormData) => {
    try {
      await mutation.mutateAsync({
        supplierInvoiceId: invoice.id,
        amount: Number(data.amount),
        method: data.method as
          | "Cash"
          | "BankTransfer"
          | "Card"
          | "Cheque",
        paymentDate: new Date(`${data.paymentDate}T00:00:00`).toISOString(),
        reference: data.reference || undefined,
        notes: data.notes || undefined,
      });
      onOpenChange(false);
    } catch {
      // Error handled via mutation state
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border">
        <DialogHeader>
          <DialogTitle>{t("purchasePayment.createTitle")}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t("supplierInvoice.invoiceNumber")}{" "}
            <span className="font-mono">{invoice.invoiceNumber}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 rounded-lg border border-border bg-muted/30 p-4 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">
              {t("supplierInvoice.netAmount")}
            </div>
            <div className="mt-0.5 font-medium tabular-nums">
              {formatCurrency(invoice.netAmount, language)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">
              {t("supplierInvoice.paidAmount")}
            </div>
            <div className="mt-0.5 font-medium tabular-nums text-emerald-600">
              {formatCurrency(invoice.paidAmount, language)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">
              {t("supplierInvoice.remainingAmount")}
            </div>
            <div className="mt-0.5 font-medium tabular-nums text-amber-600">
              {formatCurrency(remaining, language)}
            </div>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">{t("purchasePayment.amount")} *</Label>
            <Input
              id="amount"
              type="number"
              min={0.01}
              max={remaining}
              step="0.01"
              {...form.register("amount")}
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              {t("purchasePayment.maxAmount")}:{" "}
              {formatCurrency(remaining, language)}
            </p>
            {form.formState.errors.amount && (
              <p className="text-sm text-destructive">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="method">{t("purchasePayment.method")} *</Label>
              <Select
                id="method"
                {...form.register("method")}
                options={methodOptionKeys.map((option) => ({
                  value: option.value,
                  label: t(option.labelKey),
                }))}
                placeholder={t("purchasePayment.method")}
                className="h-10"
              />
              {form.formState.errors.method && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.method.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate">{t("purchasePayment.paymentDate")} *</Label>
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
            <Label htmlFor="reference">{t("purchasePayment.reference")}</Label>
            <Input
              id="reference"
              {...form.register("reference")}
              placeholder={t("purchasePayment.referencePlaceholder")}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("purchasePayment.notes")}</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder={t("common.notesPlaceholder")}
            />
          </div>

          {form.formState.errors.notes && (
            <p className="text-sm text-destructive">
              {form.formState.errors.notes.message}
            </p>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="gap-2">
              {mutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {t("purchasePayment.new")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}