"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Input,
  Button,
  Alert,
  Select,
} from "@/components/ui";
import {
  upsertInventoryLevelSchema,
  type UpsertInventoryLevelFormData,
} from "../schemas/inventory-level.schema";
import { useUpsertInventoryLevel } from "../hooks/useUpsertInventoryLevel";
import { useProducts } from "../hooks/useProducts";
import { useWarehousesForDropdown } from "../hooks/useWarehousesForDropdown";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";

export default function InventoryLevelForm() {
  const router = useRouter();
  const mutation = useUpsertInventoryLevel();
  const isPending = mutation.isPending;
  const error = mutation.error;

  const { data: productsData } = useProducts({ page: 1, pageSize: 1000, isActive: true });
  const { data: warehouses } = useWarehousesForDropdown();

  const productOptions = (productsData?.items ?? []).map((p) => ({
    value: p.id,
    label: `${p.sku} — ${p.name}`,
  }));

  const warehouseOptions = (warehouses ?? []).map((w) => ({
    value: w.id,
    label: `${w.code} — ${w.name}`,
  }));

  const zodResolverTyped = zodResolver(upsertInventoryLevelSchema) as Resolver<UpsertInventoryLevelFormData>;

  const form = useForm<UpsertInventoryLevelFormData>({
    resolver: zodResolverTyped,
    defaultValues: {
      productId: "",
      warehouseId: "",
      quantityOnHand: 0,
      avgCost: 0,
    },
  });

  const onSubmit = async (data: UpsertInventoryLevelFormData) => {
    try {
      await mutation.mutateAsync(data);
      router.push("/inventory/levels");
    } catch {
      // Error handled via mutation state
    }
  };

  const getErrorMessage = (): string | null => {
    if (!error) return null;
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    return axiosError.response?.data?.message || error.message;
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">إضافة مخزون أولي</CardTitle>
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
              />
              {form.formState.errors.productId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.productId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="warehouseId">المستودع *</Label>
              <Select
                id="warehouseId"
                {...form.register("warehouseId")}
                options={warehouseOptions}
                placeholder="اختر المستودع"
                className="h-10"
              />
              {form.formState.errors.warehouseId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.warehouseId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantityOnHand">الكمية الافتتاحية *</Label>
              <Input
                id="quantityOnHand"
                type="number"
                step="0.001"
                {...form.register("quantityOnHand", { valueAsNumber: true })}
                placeholder="0"
                className="h-10"
              />
              {form.formState.errors.quantityOnHand && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.quantityOnHand.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="avgCost">متوسط التكلفة</Label>
              <Input
                id="avgCost"
                type="number"
                step="0.0001"
                {...form.register("avgCost", { valueAsNumber: true })}
                placeholder="0"
                className="h-10"
              />
              {form.formState.errors.avgCost && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.avgCost.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              حفظ
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/inventory/levels")}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
