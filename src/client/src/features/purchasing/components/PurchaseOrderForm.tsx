"use client";

import { useMemo } from "react";
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
  purchaseOrderFormSchema,
  type PurchaseOrderFormData,
  type PoItemFormData,
} from "../schemas/purchase-order.schema";
import { useCreatePurchaseOrder } from "../hooks/useCreatePurchaseOrder";
import { useUpdatePurchaseOrder } from "../hooks/useUpdatePurchaseOrder";
import { useSuppliersForDropdown } from "../hooks/useSuppliersForDropdown";
import { useProducts } from "@/features/inventory/hooks/useProducts";
import PurchaseOrderItemsEditor from "./PurchaseOrderItemsEditor";
import PurchaseOrderSummary from "./PurchaseOrderSummary";
import { useTranslation } from "@/hooks/use-translation";
import type { PurchaseOrderResponse } from "../types/purchase-order.types";
import type { ProductListItem } from "@/features/inventory/types/product.types";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";

interface PurchaseOrderFormProps {
  mode: "create" | "edit";
  order?: PurchaseOrderResponse;
}

function todayString(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

export default function PurchaseOrderForm({
  mode,
  order,
}: PurchaseOrderFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const isEdit = mode === "edit";

  const createMutation = useCreatePurchaseOrder();
  const updateMutation = useUpdatePurchaseOrder(order?.id ?? "");
  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  const { data: suppliers } = useSuppliersForDropdown();
  const { data: productsData } = useProducts({
    page: 1,
    pageSize: 1000,
    isActive: true,
  });

  const products = productsData?.items ?? [];

  const supplierOptions = useMemo(
    () =>
      (suppliers ?? []).map((supplier) => ({
        value: supplier.id,
        label: `${supplier.code} — ${supplier.name}`,
      })),
    [suppliers]
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

  const buildDefaultItems = (): PoItemFormData[] => {
    if (isEdit && order) {
      return order.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));
    }
    return [{ productId: "", quantity: 1, unitPrice: 0 }];
  };

  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderFormSchema) as Resolver<PurchaseOrderFormData>,
    defaultValues: {
      supplierId: order?.supplierId ?? "",
      orderDate: order?.orderDate ?? todayString(),
      expectedDate: order?.expectedDate ?? "",
      currency: order?.currency ?? "SAR",
      terms: order?.terms ?? "",
      items: buildDefaultItems(),
    },
  });

  const getErrorMessage = (): string | null => {
    if (!error) return null;
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    return axiosError.response?.data?.message || error.message;
  };

  const onSubmit = async (data: PurchaseOrderFormData) => {
    const items = data.items.map((item) => ({
      productId: item.productId,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
    }));

    const base = {
      supplierId: data.supplierId,
      orderDate: data.orderDate,
      expectedDate: data.expectedDate || undefined,
      currency: data.currency || "SAR",
      terms: data.terms || undefined,
      items,
    };

    try {
      if (isEdit && order) {
        await updateMutation.mutateAsync(base);
        router.push(`/purchasing/orders/${order.id}`);
      } else {
        const created = await createMutation.mutateAsync(base);
        router.push(`/purchasing/orders/${created.id}`);
      }
    } catch {
      // Error handled via mutation state
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {isEdit ? t("purchasing.orders.editTitle") : t("purchasing.orders.createTitle")}
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
            <div className="space-y-2">
              <Label htmlFor="supplierId">{t("purchasing.orders.supplier")} *</Label>
              <Select
                id="supplierId"
                {...form.register("supplierId")}
                options={supplierOptions}
                placeholder={t("purchasing.orders.selectSupplier")}
                className="h-10"
              />
              {form.formState.errors.supplierId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.supplierId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">{t("purchasing.orders.currency")}</Label>
              <Input
                id="currency"
                {...form.register("currency")}
                placeholder="SAR"
                className="h-10"
              />
              {form.formState.errors.currency && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.currency.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderDate">{t("purchasing.orders.orderDate")} *</Label>
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

            <div className="space-y-2">
              <Label htmlFor="expectedDate">{t("purchasing.orders.expectedDate")}</Label>
              <Input
                id="expectedDate"
                type="date"
                {...form.register("expectedDate")}
                className="h-10"
              />
              {form.formState.errors.expectedDate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.expectedDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms">{t("purchasing.orders.terms")}</Label>
            <Textarea
              id="terms"
              {...form.register("terms")}
              placeholder={t("purchasing.orders.termsPlaceholder")}
            />
            {form.formState.errors.terms && (
              <p className="text-sm text-destructive">
                {form.formState.errors.terms.message}
              </p>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <PurchaseOrderItemsEditor
                control={form.control}
                register={form.register}
                setValue={form.setValue}
                setError={form.setError}
                clearErrors={form.clearErrors}
                errors={form.formState.errors}
                productOptions={productOptions}
                productById={(id) => productsById.get(id)}
              />
            </div>
            <PurchaseOrderSummary control={form.control} />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {isEdit ? t("common.saveChanges") : t("purchasing.orders.create")}
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
