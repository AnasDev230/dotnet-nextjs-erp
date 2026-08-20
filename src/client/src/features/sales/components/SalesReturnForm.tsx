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
  salesReturnFormSchema,
  type SalesReturnFormData,
} from "../schemas/sales-return.schema";
import { useCreateSalesReturn } from "../hooks/useSalesReturns";
import { useCustomersForDropdown } from "../hooks/useCustomersForDropdown";
import { useWarehousesForDropdown } from "@/features/inventory/hooks/useWarehousesForDropdown";
import { useInvoices, useInvoice } from "@/features/finance/hooks/useInvoices";
import { useSalesOrder } from "@/features/sales/hooks/useSalesOrder";
import SalesReturnItemsEditor from "./SalesReturnItemsEditor";
import type { SalesOrderItemResponse } from "../types/sales-order.types";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";
import { useTranslation } from "@/hooks/use-translation";

function todayString(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

export default function SalesReturnForm() {
  const router = useRouter();
  const { t } = useTranslation();

  const createMutation = useCreateSalesReturn();
  const isPending = createMutation.isPending;
  const error = createMutation.error;

  const { data: customers } = useCustomersForDropdown();
  const { data: warehouses } = useWarehousesForDropdown();
  const { data: invoicesData } = useInvoices({ page: 1, pageSize: 1000 });

  const eligibleInvoices = useMemo(
    () =>
      (invoicesData?.items ?? []).filter((invoice) =>
        ["Issued", "PartiallyPaid", "Paid"].includes(invoice.status)
      ),
    [invoicesData]
  );

  const invoiceOptions = useMemo(
    () =>
      eligibleInvoices.map((invoice) => ({
        value: invoice.id,
        label: `${invoice.invoiceNumber} — ${invoice.customerName}`,
      })),
    [eligibleInvoices]
  );

  const warehouseOptions = useMemo(
    () =>
      (warehouses ?? []).map((warehouse) => ({
        value: warehouse.id,
        label: `${warehouse.code} — ${warehouse.name}`,
      })),
    [warehouses]
  );

  const form = useForm<SalesReturnFormData>({
    resolver: zodResolver(salesReturnFormSchema) as Resolver<SalesReturnFormData>,
    defaultValues: {
      invoiceId: "",
      customerId: "",
      warehouseId: "",
      returnDate: todayString(),
      reason: "",
      items: [],
    },
  });

  const watchedInvoiceId = form.watch("invoiceId");

  const { data: invoice, isLoading: isInvoiceLoading } = useInvoice(
    watchedInvoiceId || undefined
  );

  const { data: salesOrder, isLoading: isOrderLoading } = useSalesOrder(
    invoice?.orderId || undefined
  );

  const orderItems: SalesOrderItemResponse[] = salesOrder?.items ?? [];

  useEffect(() => {
    if (invoice?.customerId) {
      form.setValue("customerId", invoice.customerId);
    }
  }, [invoice, form]);

  useEffect(() => {
    if (!watchedInvoiceId) {
      form.setValue("customerId", "");
      form.setValue("items", []);
    }
  }, [watchedInvoiceId, form]);

  const getErrorMessage = (): string | null => {
    if (!error) return null;
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    return axiosError.response?.data?.message || error.message;
  };

  const onSubmit = async (data: SalesReturnFormData) => {
    const items = data.items.map((item) => ({
      productId: item.productId,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      reason: item.reason || undefined,
    }));

    try {
      const created = await createMutation.mutateAsync({
        invoiceId: data.invoiceId,
        customerId: data.customerId,
        warehouseId: data.warehouseId,
        returnDate: data.returnDate,
        reason: data.reason || undefined,
        items,
      });
      router.push(`/sales/returns/${created.id}`);
    } catch {
      // Error handled via mutation state
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{t("returns.new.sales")}</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <p>{getErrorMessage()}</p>
          </Alert>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <input type="hidden" {...form.register("customerId")} />

          <div className="grid gap-4 md:grid-cols-2">
            {/* Invoice */}
            <div className="space-y-2">
              <Label htmlFor="invoiceId">{t("returns.invoice")} *</Label>
              <Select
                id="invoiceId"
                {...form.register("invoiceId")}
                options={invoiceOptions}
                placeholder={t("returns.selectInvoice")}
                className="h-10"
              />
              {form.formState.errors.invoiceId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.invoiceId.message}
                </p>
              )}
              {isInvoiceLoading && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {t("returns.loadingInvoice")}
                </p>
              )}
            </div>

            {/* Customer (auto-filled from invoice) */}
            <div className="space-y-2">
              <Label htmlFor="customer">{t("returns.customer")}</Label>
              <div
                id="customer"
                className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm"
              >
                {invoice?.customerName ?? "—"}
              </div>
            </div>

            {/* Warehouse */}
            <div className="space-y-2">
              <Label htmlFor="warehouseId">{t("returns.warehouse")} *</Label>
              <Select
                id="warehouseId"
                {...form.register("warehouseId")}
                options={warehouseOptions}
                placeholder={t("returns.selectWarehouse")}
                className="h-10"
              />
              {form.formState.errors.warehouseId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.warehouseId.message}
                </p>
              )}
            </div>

            {/* Return Date */}
            <div className="space-y-2">
              <Label htmlFor="returnDate">{t("returns.returnDate")} *</Label>
              <Input
                id="returnDate"
                type="date"
                {...form.register("returnDate")}
                className="h-10"
              />
              {form.formState.errors.returnDate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.returnDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">{t("returns.reason")}</Label>
            <Textarea
              id="reason"
              {...form.register("reason")}
              placeholder={t("returns.reasonPlaceholder")}
            />
            {form.formState.errors.reason && (
              <p className="text-sm text-destructive">
                {form.formState.errors.reason.message}
              </p>
            )}
          </div>

          {/* Items */}
          <SalesReturnItemsEditor
            control={form.control}
            register={form.register}
            setValue={form.setValue}
            errors={form.formState.errors}
            orderItems={orderItems}
            orderLoading={isOrderLoading || isInvoiceLoading}
            itemsAvailable={!!salesOrder}
          />

          {/* Actions */}
          <div className="flex items-center gap-3 border-t border-border pt-4">
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("returns.create")}
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