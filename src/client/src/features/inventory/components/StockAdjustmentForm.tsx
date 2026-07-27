"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Input,
  Button,
  Textarea,
  Alert,
  Select,
} from "@/components/ui";
import {
  createStockAdjustmentSchema,
  type CreateStockAdjustmentFormData,
} from "../schemas/stock-adjustment.schema";
import { useCreateStockAdjustment } from "../hooks/useCreateStockAdjustment";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";

interface StockAdjustmentFormProps {
  productOptions: { value: string; label: string }[];
  warehouseOptions: { value: string; label: string }[];
  initialProductId?: string;
  initialWarehouseId?: string;
}

export default function StockAdjustmentForm({
  productOptions,
  warehouseOptions,
  initialProductId,
  initialWarehouseId,
}: StockAdjustmentFormProps) {
  const router = useRouter();
  const mutation = useCreateStockAdjustment();
  const isPending = mutation.isPending;
  const error = mutation.error;

  const [systemQty, setSystemQty] = useState<number | null>(null);

  const zodResolverTyped = zodResolver(createStockAdjustmentSchema) as Resolver<CreateStockAdjustmentFormData>;

  const form = useForm<CreateStockAdjustmentFormData>({
    resolver: zodResolverTyped,
    defaultValues: {
      productId: initialProductId ?? "",
      warehouseId: initialWarehouseId ?? "",
      countedQty: 0,
      reason: "",
    },
  });

  const watchedProductId = form.watch("productId");
  const watchedWarehouseId = form.watch("warehouseId");
  const watchedCountedQty = form.watch("countedQty");

  const variance = systemQty !== null ? watchedCountedQty - systemQty : null;
  const varianceColor =
    variance === null
      ? ""
      : variance > 0
      ? "text-emerald-600"
      : variance < 0
      ? "text-red-600"
      : "text-muted-foreground";

  const onSubmit = async (data: CreateStockAdjustmentFormData) => {
    try {
      await mutation.mutateAsync(data);
      router.push("/inventory/adjustments");
    } catch {
      // Error handled via mutation state
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">تسوية مخزون جديدة</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <p>
              حدث خطأ:{" "}
              {(error as AxiosError<ApiResponse<unknown>>)?.response?.data?.message || error.message}
            </p>
          </Alert>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

          {systemQty !== null && (
            <div className="rounded-md bg-muted px-4 py-3 text-sm">
              <span className="text-muted-foreground">الكمية الحالية في النظام: </span>
              <span className="font-semibold">{systemQty}</span>
            </div>
          )}

          {watchedProductId && watchedWarehouseId && systemQty === null && (
            <div className="flex h-10 items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              جاري تحميل الكمية الحالية...
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="countedQty">الكمية المعدودة *</Label>
            <Input
              id="countedQty"
              type="number"
              step="0.001"
              {...form.register("countedQty", { valueAsNumber: true })}
              placeholder="0"
              className="h-10"
            />
            {form.formState.errors.countedQty && (
              <p className="text-sm text-destructive">
                {form.formState.errors.countedQty.message}
              </p>
            )}
          </div>

          {variance !== null && (
            <div className="rounded-md bg-muted px-4 py-3 text-sm">
              <span className="text-muted-foreground">الفرق: </span>
              <span className={`font-semibold ${varianceColor}`}>
                {variance > 0 ? "+" : ""}
                {variance}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">سبب التسوية *</Label>
            <Textarea
              id="reason"
              {...form.register("reason")}
              placeholder="أدخل سبب التسوية"
              rows={3}
            />
            {form.formState.errors.reason && (
              <p className="text-sm text-destructive">
                {form.formState.errors.reason.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={isPending}>
              {isPending && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              )}
              تأكيد التسوية
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              <ArrowRight className="ml-2 h-4 w-4" />
              رجوع
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
