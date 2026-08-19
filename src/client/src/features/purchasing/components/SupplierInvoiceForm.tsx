"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Input,
  Textarea,
  Button,
  Select,
  Alert,
} from "@/components/ui";
import {
  supplierInvoiceFormSchema,
  type SupplierInvoiceFormData,
} from "../schemas/supplier-invoice.schema";
import { useCreateSupplierInvoice } from "../hooks/useCreateSupplierInvoice";
import { useUpdateSupplierInvoice } from "../hooks/useUpdateSupplierInvoice";
import { usePurchaseOrders } from "../hooks/usePurchaseOrders";
import { usePurchaseOrder } from "../hooks/usePurchaseOrder";
import { useSupplierInvoice } from "../hooks/useSupplierInvoice";
import { useTranslation } from "@/hooks/use-translation";
import { formatCurrency } from "@/lib/formatters";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";

function todayString(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

function addDaysString(days: number): string {
  const now = new Date();
  const target = new Date(now.getTime() + days * 86400000);
  const offset = target.getTimezoneOffset();
  const local = new Date(target.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

interface SupplierInvoiceFormProps {
  mode: "create" | "edit";
  invoiceId?: string;
}

export default function SupplierInvoiceForm({
  mode,
  invoiceId,
}: SupplierInvoiceFormProps) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const createMutation = useCreateSupplierInvoice();
  const updateMutation = useUpdateSupplierInvoice();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = mode === "edit" ? updateMutation.error : createMutation.error;

  const { data: ordersData } = usePurchaseOrders({
    page: 1,
    pageSize: 1000,
  });
  const { data: invoice, isLoading: invoiceLoading } = useSupplierInvoice(
    mode === "edit" ? (invoiceId ?? "") : ""
  );

  const form = useForm<SupplierInvoiceFormData>({
    resolver: zodResolver(supplierInvoiceFormSchema) as Resolver<SupplierInvoiceFormData>,
    defaultValues: {
      purchaseOrderId: "",
      supplierId: "",
      issueDate: todayString(),
      dueDate: addDaysString(30),
      subtotal: 0,
      taxAmount: 0,
      supplierReference: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (mode === "edit" && invoice) {
      form.reset({
        purchaseOrderId: invoice.purchaseOrderId,
        supplierId: invoice.supplierId,
        issueDate: invoice.issueDate.slice(0, 10),
        dueDate: invoice.dueDate.slice(0, 10),
        subtotal: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        supplierReference: invoice.supplierReference ?? "",
        notes: invoice.notes ?? "",
      });
    }
  }, [mode, invoice, form]);

  const watchedOrderId = form.watch("purchaseOrderId");
  const watchedSubtotal = form.watch("subtotal");
  const watchedTaxAmount = form.watch("taxAmount");

  const { data: order } = usePurchaseOrder(
    mode === "create" && watchedOrderId ? watchedOrderId : undefined
  );

  const orderOptions = useMemo(
    () =>
      (ordersData?.items ?? [])
        .filter(
          (o) =>
            o.status === "Approved" ||
            o.status === "PartiallyReceived" ||
            o.status === "Received"
        )
        .map((o) => ({
          value: o.id,
          label: `${o.poNumber} — ${o.supplierName}`,
        })),
    [ordersData]
  );

  useEffect(() => {
    if (mode === "create" && order) {
      form.setValue("supplierId", order.supplierId);
    }
  }, [mode, order, form]);

  const netAmount =
    (Number(watchedSubtotal) || 0) + (Number(watchedTaxAmount) || 0);

  const onSubmit = async (data: SupplierInvoiceFormData) => {
    try {
      if (mode === "create") {
        const created = await createMutation.mutateAsync({
          purchaseOrderId: data.purchaseOrderId,
          supplierId: data.supplierId,
          issueDate: new Date(`${data.issueDate}T00:00:00`).toISOString(),
          dueDate: new Date(`${data.dueDate}T00:00:00`).toISOString(),
          subtotal: Number(data.subtotal),
          taxAmount: Number(data.taxAmount),
          notes: data.notes || undefined,
          supplierReference: data.supplierReference || undefined,
        });
        router.push(`/purchasing/supplier-invoices/${created.id}`);
      } else {
        await updateMutation.mutateAsync({
          id: invoiceId!,
          data: {
            issueDate: new Date(`${data.issueDate}T00:00:00`).toISOString(),
            dueDate: new Date(`${data.dueDate}T00:00:00`).toISOString(),
            subtotal: Number(data.subtotal),
            taxAmount: Number(data.taxAmount),
            notes: data.notes || undefined,
            supplierReference: data.supplierReference || undefined,
          },
        });
        router.push(`/purchasing/supplier-invoices/${invoiceId}`);
      }
    } catch {
      // Error handled via mutation state
    }
  };

  if (mode === "edit" && invoiceLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getErrorMessage = (): string | null => {
    if (!error) return null;
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    return axiosError.response?.data?.message || error.message;
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {mode === "create"
            ? t("supplierInvoice.createTitle")
            : t("supplierInvoice.editTitle")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {mode === "create"
            ? t("supplierInvoice.createPageDescription")
            : t("supplierInvoice.editPageDescription")}
        </p>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <p>{getErrorMessage()}</p>
          </Alert>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {mode === "create" && (
              <div className="space-y-2">
                <Label htmlFor="purchaseOrderId">{t("supplierInvoice.purchaseOrder")} *</Label>
                <Select
                  id="purchaseOrderId"
                  {...form.register("purchaseOrderId")}
                  options={orderOptions}
                  placeholder={t("supplierInvoice.selectPurchaseOrder")}
                  className="h-10"
                />
                {form.formState.errors.purchaseOrderId && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.purchaseOrderId.message}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>{t("supplierInvoice.supplier")}</Label>
              <Input
                value={order?.supplierName ?? invoice?.supplierName ?? ""}
                readOnly
                disabled
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issueDate">{t("supplierInvoice.issueDate")} *</Label>
              <Input
                id="issueDate"
                type="date"
                {...form.register("issueDate")}
                className="h-10"
              />
              {form.formState.errors.issueDate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.issueDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">{t("supplierInvoice.dueDate")} *</Label>
              <Input
                id="dueDate"
                type="date"
                {...form.register("dueDate")}
                className="h-10"
              />
              {form.formState.errors.dueDate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.dueDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtotal">{t("supplierInvoice.subtotal")} *</Label>
              <Input
                id="subtotal"
                type="number"
                min={0}
                step="0.01"
                {...form.register("subtotal")}
                className="h-10"
              />
              {form.formState.errors.subtotal && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.subtotal.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxAmount">{t("supplierInvoice.taxAmount")} *</Label>
              <Input
                id="taxAmount"
                type="number"
                min={0}
                step="0.01"
                {...form.register("taxAmount")}
                className="h-10"
              />
              {form.formState.errors.taxAmount && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.taxAmount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t("supplierInvoice.netAmount")}</Label>
              <Input
                value={formatCurrency(netAmount, language)}
                readOnly
                disabled
                className="h-10 font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplierReference">{t("supplierInvoice.supplierReference")}</Label>
              <Input
                id="supplierReference"
                {...form.register("supplierReference")}
                placeholder={t("supplierInvoice.supplierReferencePlaceholder")}
                className="h-10"
              />
              {form.formState.errors.supplierReference && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.supplierReference.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("supplierInvoice.notes")}</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder={t("common.notesPlaceholder")}
            />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "create" ? t("common.save") : t("common.saveChanges")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}