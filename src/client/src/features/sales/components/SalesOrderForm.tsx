"use client";

import { useMemo } from "react";
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
  salesOrderFormSchema,
  type SalesOrderFormData,
  type SalesOrderItemFormData,
} from "../schemas/sales-order.schema";
import { useCreateSalesOrder } from "../hooks/useCreateSalesOrder";
import { useUpdateSalesOrder } from "../hooks/useUpdateSalesOrder";
import { useCustomersForDropdown } from "../hooks/useCustomersForDropdown";
import { useProducts } from "@/features/inventory/hooks/useProducts";
import SalesOrderItemsEditor from "./SalesOrderItemsEditor";
import SalesOrderSummary from "./SalesOrderSummary";
import type { SalesOrderResponse } from "../types/sales-order.types";
import type { ProductListItem } from "@/features/inventory/types/product.types";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";

const statusOptions = [
  { value: "Draft", label: "مسودة" },
  { value: "Confirmed", label: "مؤكد" },
  { value: "Cancelled", label: "ملغي" },
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

  const products = productsData?.items ?? [];

  const customerOptions = useMemo(
    () =>
      (customers ?? []).map((customer) => ({
        value: customer.id,
        label: `${customer.code} — ${customer.name}`,
      })),
    [customers]
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

  const zodResolverTyped = zodResolver(salesOrderFormSchema) as Resolver<SalesOrderFormData>;

  const buildDefaultItems = (): SalesOrderItemFormData[] => {
    if (isEdit && order) {
      return order.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));
    }
    return [{ productId: "", quantity: 1, unitPrice: 0 }];
  };

  const form = useForm<SalesOrderFormData>({
    resolver: zodResolverTyped,
    defaultValues: {
      customerId: order?.customerId ?? "",
      orderDate: order?.orderDate ?? todayString(),
      deliveryDate: order?.deliveryDate ?? "",
      notes: order?.notes ?? "",
      status: order?.status ?? "Draft",
      items: buildDefaultItems(),
    },
  });

  const watchedStatus = form.watch("status");

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
    }));

    const base = {
      customerId: data.customerId,
      orderDate: data.orderDate,
      deliveryDate: data.deliveryDate || undefined,
      notes: data.notes || undefined,
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
          {isEdit ? "تعديل أمر البيع" : "أمر بيع جديد"}
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
            {/* Customer */}
            <div className="space-y-2">
              <Label htmlFor="customerId">العميل *</Label>
              <Select
                id="customerId"
                {...form.register("customerId")}
                options={customerOptions}
                placeholder="اختر العميل"
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
              <Label htmlFor="orderDate">تاريخ الأمر *</Label>
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
              <Label htmlFor="deliveryDate">تاريخ التسليم</Label>
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
                <Label htmlFor="status">الحالة</Label>
                <Select
                  id="status"
                  {...form.register("status")}
                  options={statusOptions}
                  placeholder="اختر الحالة"
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
                  ? "سيتم تأكيد الأمر ولن تتمكن من تعديله لاحقاً"
                  : "سيتم إلغاء الأمر ولن تتمكن من تعديله لاحقاً"}
              </p>
            </Alert>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder="ملاحظات اختيارية..."
            />
            {form.formState.errors.notes && (
              <p className="text-sm text-destructive">
                {form.formState.errors.notes.message}
              </p>
            )}
          </div>

          {/* Items + Summary */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <SalesOrderItemsEditor
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
            <SalesOrderSummary control={form.control} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {isEdit ? "حفظ التغييرات" : "إنشاء الأمر"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
