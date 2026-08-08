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
  Button,
  Select,
  Alert,
} from "@/components/ui";
import {
  createProductSupplierSchema,
  type CreateProductSupplierFormData,
} from "../schemas/product-supplier.schema";
import { useCreateProductSupplier } from "../hooks/useCreateProductSupplier";
import { useProducts } from "@/features/inventory/hooks/useProducts";
import { useSuppliersForDropdown } from "../hooks/useSuppliersForDropdown";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";

interface ProductSupplierFormProps {
  preSelectedProductId?: string;
}

export default function ProductSupplierForm({
  preSelectedProductId,
}: ProductSupplierFormProps) {
  const router = useRouter();
  const createMutation = useCreateProductSupplier();
  const isPending = createMutation.isPending;
  const error = createMutation.error;

  const { data: productsData } = useProducts({
    page: 1,
    pageSize: 1000,
    isActive: true,
  });
  const { data: suppliers } = useSuppliersForDropdown();

  const products = productsData?.items ?? [];

  const productOptions = useMemo(
    () =>
      products.map((product) => ({
        value: product.id,
        label: `${product.sku} — ${product.name}`,
      })),
    [products]
  );

  const supplierOptions = useMemo(
    () =>
      (suppliers ?? []).map((supplier) => ({
        value: supplier.id,
        label: `${supplier.code} — ${supplier.name}`,
      })),
    [suppliers]
  );

  const form = useForm<CreateProductSupplierFormData>({
    resolver: zodResolver(
      createProductSupplierSchema
    ) as Resolver<CreateProductSupplierFormData>,
    defaultValues: {
      productId: preSelectedProductId ?? "",
      supplierId: "",
      supplierSku: "",
      leadTimeDays: 0,
      minOrderQty: 0,
      unitCost: 0,
      isPrimary: false,
    },
  });

  const getErrorMessage = (): string | null => {
    if (!error) return null;
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    return axiosError.response?.data?.message || error.message;
  };

  const onSubmit = async (data: CreateProductSupplierFormData) => {
    const payload = {
      productId: data.productId,
      supplierId: data.supplierId,
      supplierSku: (data.supplierSku || undefined) as string | undefined,
      leadTimeDays: Number(data.leadTimeDays),
      minOrderQty: Number(data.minOrderQty),
      unitCost: Number(data.unitCost),
      isPrimary: data.isPrimary,
    };

    try {
      await createMutation.mutateAsync(payload);
      router.back();
    } catch {
      // Error handled via mutation state
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">ربط منتج بمورد</CardTitle>
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
              <Label htmlFor="productId">المنتج *</Label>
              <Select
                id="productId"
                {...form.register("productId")}
                options={productOptions}
                placeholder="اختر المنتج"
                className="h-10"
                disabled={!!preSelectedProductId}
              />
              {form.formState.errors.productId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.productId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplierId">المورد *</Label>
              <Select
                id="supplierId"
                {...form.register("supplierId")}
                options={supplierOptions}
                placeholder="اختر المورد"
                className="h-10"
              />
              {form.formState.errors.supplierId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.supplierId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplierSku">رمز المورد للصنف</Label>
              <Input
                id="supplierSku"
                {...form.register("supplierSku")}
                placeholder="رمز المورد لهذا المنتج"
                className="h-10"
              />
              {form.formState.errors.supplierSku && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.supplierSku.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="leadTimeDays">مدة التسليم (أيام)</Label>
              <Input
                id="leadTimeDays"
                type="number"
                min={0}
                step={1}
                {...form.register("leadTimeDays", { valueAsNumber: true })}
                className="h-10"
              />
              {form.formState.errors.leadTimeDays && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.leadTimeDays.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="minOrderQty">الحد الأدنى للكمية</Label>
              <Input
                id="minOrderQty"
                type="number"
                min={0}
                step="0.001"
                {...form.register("minOrderQty", { valueAsNumber: true })}
                className="h-10"
              />
              {form.formState.errors.minOrderQty && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.minOrderQty.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitCost">تكلفة الوحدة</Label>
              <Input
                id="unitCost"
                type="number"
                min={0}
                step="0.01"
                {...form.register("unitCost", { valueAsNumber: true })}
                className="h-10"
              />
              {form.formState.errors.unitCost && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.unitCost.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 md:col-span-2">
              <input
                id="isPrimary"
                type="checkbox"
                className="h-4 w-4 rounded border-input accent-primary"
                {...form.register("isPrimary")}
              />
              <Label htmlFor="isPrimary" className="font-normal">
                مورد أساسي لهذا المنتج
              </Label>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              ربط المنتج بالمورد
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
