"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertCircle } from "lucide-react";
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
  createSalesOrderFormSchema,
  type SalesOrderFormData,
  type SalesOrderItemFormData,
} from "../schemas/sales-order.schema";
import { useCreateSalesOrder } from "../hooks/useCreateSalesOrder";
import { useUpdateSalesOrder } from "../hooks/useUpdateSalesOrder";
import { useCustomersForDropdown } from "../hooks/useCustomersForDropdown";
import { useTaxRates } from "../hooks/useTaxRates";
import { useProducts } from "@/features/inventory/hooks/useProducts";
import { useWarehousesForDropdown } from "@/features/inventory/hooks/useWarehousesForDropdown";
import { useInventoryLevels } from "@/features/inventory/hooks/useInventoryLevels";
import SalesOrderItemsEditor from "./SalesOrderItemsEditor";
import SalesOrderSummary from "./SalesOrderSummary";
import type { SalesOrderResponse } from "../types/sales-order.types";
import type { ProductListItem } from "@/features/inventory/types/product.types";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";
import { useTranslation } from "@/hooks/use-translation";

const statusOptionKeys = [
  { value: "Draft", labelKey: "sales.orders.draft" },
  { value: "Confirmed", labelKey: "sales.orders.confirmed" },
  { value: "Cancelled", labelKey: "sales.orders.cancelled" },
];

interface SalesOrderFormProps {
  mode: "create" | "edit";
  order?: SalesOrderResponse;
}

function todayString(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

export default function SalesOrderForm({ mode, order }: SalesOrderFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const { t } = useTranslation();

  const createMutation = useCreateSalesOrder();
  const updateMutation = useUpdateSalesOrder(order?.id ?? "");
  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  const { data: customers } = useCustomersForDropdown();
  const { data: productsData } = useProducts({
    page: 1,
    pageSize: 1000,
    isActive: true,
  });
  const { data: taxRatesData } = useTaxRates();
  const { data: warehouses } = useWarehousesForDropdown();

  const products = productsData?.items ?? [];
  const taxRates = taxRatesData ?? [];

  const customerOptions = useMemo(
    () =>
      (customers ?? []).map((customer) => ({
        value: customer.id,
        label: `${customer.code} — ${customer.name}`,
      })),
    [customers]
  );

  const warehouseOptions = useMemo(
    () =>
      (warehouses ?? []).map((warehouse) => ({
        value: warehouse.id,
        label: `${warehouse.code} — ${warehouse.name}`,
      })),
    [warehouses]
  );

  const taxRateOptions = useMemo(
    () => [
      { value: "", label: t("sales.orders.noTax") },
      ...taxRates.map((rate) => ({
        value: rate.id,
        label: `${rate.name} (${rate.rate}%)`,
      })),
    ],
    [taxRates, t]
  );

  const productOptions = useMemo(
    () =>
      products.map((product) => ({
        value: product.id,
        label: `${product.sku} — ${product.name}`,
      })),
    [products]
  );

  const productsById = useMemo(() => {
    const map = new Map<string, ProductListItem>();
    products.forEach((product) => map.set(product.id, product));
    return map;
  }, [products]);

  // Stock availability is read lazily by the zod resolver at validation time.
  const stockRef = useRef({ map: new Map<string, number>(), enabled: false });

  const resolver = useMemo(
    () =>
      zodResolver(
        createSalesOrderFormSchema((productId) => {
          const current = stockRef.current;
          return current.enabled ? current.map.get(productId) : undefined;
        })
      ) as Resolver<SalesOrderFormData>,
    []
  );

  const buildDefaultItems = (): SalesOrderItemFormData[] => {
    if (isEdit && order) {
      return order.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPct: item.discountPct,
      }));
    }
    return [{ productId: "", quantity: 1, unitPrice: 0, discountPct: 0 }];
  };

  const form = useForm<SalesOrderFormData>({
    resolver,
    defaultValues: {
      customerId: order?.customerId ?? "",
      warehouseId: order?.warehouseId ?? "",
      orderDate: order?.orderDate ?? todayString(),
      deliveryDate: order?.deliveryDate ?? "",
      notes: order?.notes ?? "",
      status: order?.status ?? "Draft",
      discountPct: order?.discountPct ?? 0,
      taxRateId: order?.taxRateId ?? "",
      items: buildDefaultItems(),
    },
  });

  const watchedStatus = form.watch("status");
  const watchedWarehouseId = form.watch("warehouseId");

  const { data: stockData, isLoading: isStockLoading } = useInventoryLevels(
    {
      warehouseId: watchedWarehouseId || undefined,
      page: 1,
      pageSize: 1000,
    },
    { enabled: !!watchedWarehouseId }
  );

  const availableStockByProduct = useMemo(() => {
    const map = new Map<string, number>();
    (stockData?.items ?? []).forEach((level) =>
      map.set(level.productId, level.quantityAvailable)
    );

    // When editing an order, the stock already reserved by this very order is
    // deducted from QuantityAvailable. Exclude it (only for the same warehouse)
    // so the availability check matches the server's release-then-re-reserve
    // logic. Without this, an order of 5 from a stock of 8 shows available 3
    // and can never be confirmed/updated.
    if (isEdit && order && order.warehouseId === watchedWarehouseId) {
      order.items.forEach((item) => {
        const current = map.get(item.productId);
        if (current !== undefined) {
          map.set(item.productId, current + item.quantity);
        }
      });
    }

    return map;
  }, [stockData, isEdit, order, watchedWarehouseId]);

  useEffect(() => {
    stockRef.current = {
      map: availableStockByProduct,
      enabled: !!watchedWarehouseId,
    };
  }, [availableStockByProduct, watchedWarehouseId]);

  const getErrorMessage = (): string | null => {
    if (!error) return null;
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    return axiosError.response?.data?.message || error.message;
  };

  const onSubmit = async (data: SalesOrderFormData) => {
    const items = data.items.map((item) => ({
      productId: item.productId,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      discountPct: Number(item.discountPct) || 0,
    }));

    const base = {
      customerId: data.customerId,
      warehouseId: data.warehouseId,
      orderDate: data.orderDate,
      deliveryDate: data.deliveryDate || undefined,
      notes: data.notes || undefined,
      discountPct: Number(data.discountPct) || 0,
      taxRateId: data.taxRateId || undefined,
    };

    try {
      if (isEdit && order) {
        await updateMutation.mutateAsync({
          ...base,
          status: data.status ?? "Draft",
          items,
        });
        router.push(`/sales/orders/${order.id}`);
      } else {
        const created = await createMutation.mutateAsync({ ...base, items });
        router.push(`/sales/orders/${created.id}`);
      }
    } catch {
      // Error handled via mutation state
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {isEdit ? t("sales.orders.editTitle") : t("sales.orders.newTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <p>{getErrorMessage()}</p>
          </Alert>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Warehouse */}
            <div className="space-y-2">
              <Label htmlFor="warehouseId">{t("purchasing.receipts.warehouse")} *</Label>
              <Select
                id="warehouseId"
                {...form.register("warehouseId")}
                options={warehouseOptions}
                placeholder={t("common.selectWarehouse")}
                className="h-10"
              />
              {form.formState.errors.warehouseId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.warehouseId.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {t("sales.orders.warehouseFirstHint")}
              </p>
            </div>

            {/* Customer */}
            <div className="space-y-2">
              <Label htmlFor="customerId">{t("sales.orders.customer")} *</Label>
              <Select
                id="customerId"
                {...form.register("customerId")}
                options={customerOptions}
                placeholder={t("common.selectCustomer")}
                className="h-10"
              />
              {form.formState.errors.customerId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.customerId.message}
                </p>
              )}
            </div>

            {/* Order Date */}
            <div className="space-y-2">
              <Label htmlFor="orderDate">{t("sales.orders.orderDate")} *</Label>
              <Input
                id="orderDate"
                type="date"
                {...form.register("orderDate")}
                className="h-10"
              />
              {form.formState.errors.orderDate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.orderDate.message}
                </p>
              )}
            </div>

            {/* Delivery Date */}
            <div className="space-y-2">
              <Label htmlFor="deliveryDate">{t("sales.orders.deliveryDate")}</Label>
              <Input
                id="deliveryDate"
                type="date"
                {...form.register("deliveryDate")}
                className="h-10"
              />
              {form.formState.errors.deliveryDate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.deliveryDate.message}
                </p>
              )}
            </div>

            {/* Status — edit only */}
            {isEdit && (
              <div className="space-y-2">
                <Label htmlFor="status">{t("common.status")}</Label>
                <Select
                  id="status"
                  {...form.register("status")}
                  options={statusOptionKeys.map((option) => ({
                    value: option.value,
                    label: t(option.labelKey),
                  }))}
                  placeholder={t("common.selectStatus")}
                  className="h-10"
                />
                {form.formState.errors.status && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.status.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {isEdit && watchedStatus !== "Draft" && (
            <Alert className="border-amber-500/20 bg-amber-500/10 text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <p>
                {watchedStatus === "Confirmed"
                  ? t("sales.orders.confirmWarning")
                  : t("sales.orders.cancelWarning")}
              </p>
            </Alert>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t("common.notes")}</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder={t("common.notesPlaceholder")}
            />
            {form.formState.errors.notes && (
              <p className="text-sm text-destructive">
                {form.formState.errors.notes.message}
              </p>
            )}
          </div>

          {/* Items + Discount/Tax + Summary */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <SalesOrderItemsEditor
                control={form.control}
                register={form.register}
                setValue={form.setValue}
                setError={form.setError}
                clearErrors={form.clearErrors}
                errors={form.formState.errors}
                productOptions={productOptions}
                productById={(id) => productsById.get(id)}
                availableStockByProduct={availableStockByProduct}
                warehouseSelected={!!watchedWarehouseId}
                isStockLoading={isStockLoading}
              />

              {/* Discount & Tax */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{t("sales.orders.discountTax")}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="discountPct">{t("sales.orders.orderDiscountPct")}</Label>
                    <Input
                      id="discountPct"
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      {...form.register("discountPct", {
                        valueAsNumber: true,
                      })}
                      className="h-10"
                    />
                    {form.formState.errors.discountPct && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.discountPct.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxRateId">{t("sales.orders.taxRate")}</Label>
                    <Select
                      id="taxRateId"
                      {...form.register("taxRateId")}
                      options={taxRateOptions}
                      placeholder={t("sales.orders.selectTaxRate")}
                      className="h-10"
                    />
                    {form.formState.errors.taxRateId && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.taxRateId.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            <SalesOrderSummary control={form.control} taxRates={taxRates} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? t("common.saveChanges") : t("sales.orders.create")}
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
