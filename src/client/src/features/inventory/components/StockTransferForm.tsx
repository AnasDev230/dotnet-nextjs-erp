"use client";

import { useEffect } from "react";
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
  createStockTransferSchema,
  type CreateStockTransferFormData,
} from "../schemas/stock-transfer.schema";
import { useCreateStockTransfer } from "../hooks/useCreateStockTransfer";
import { useUpdateStockTransfer } from "../hooks/useUpdateStockTransfer";
import { useInventoryLevels } from "../hooks/useInventoryLevels";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";
import type { StockTransferDetail } from "../types/stock-transfer.types";
import { useTranslation } from "@/hooks/use-translation";

interface StockTransferFormProps {
  transfer?: StockTransferDetail;
  productOptions: { value: string; label: string }[];
  warehouseOptions: { value: string; label: string }[];
}

export default function StockTransferForm({
  transfer,
  productOptions,
  warehouseOptions,
}: StockTransferFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const isEdit = !!transfer;

  const createMutation = useCreateStockTransfer();
  const updateMutation = useUpdateStockTransfer(transfer?.id ?? "");
  const mutation = isEdit ? updateMutation : createMutation;
  const isPending = mutation.isPending;
  const error = mutation.error;

  const zodResolverTyped = zodResolver(
    createStockTransferSchema
  ) as Resolver<CreateStockTransferFormData>;

  const form = useForm<CreateStockTransferFormData>({
    resolver: zodResolverTyped,
    defaultValues: {
      fromWarehouseId: transfer?.fromWarehouseId ?? "",
      toWarehouseId: transfer?.toWarehouseId ?? "",
      productId: transfer?.productId ?? "",
      quantity: transfer?.quantity ?? 1,
      notes: transfer?.notes ?? "",
    },
  });

  const watchedFromWarehouseId = form.watch("fromWarehouseId");
  const watchedToWarehouseId = form.watch("toWarehouseId");
  const watchedProductId = form.watch("productId");

  const toWarehouseOptions = warehouseOptions.filter(
    (warehouse) => warehouse.value !== watchedFromWarehouseId
  );

  useEffect(() => {
    if (
      watchedFromWarehouseId &&
      watchedToWarehouseId &&
      watchedFromWarehouseId === watchedToWarehouseId
    ) {
      form.setValue("toWarehouseId", "");
    }
  }, [watchedFromWarehouseId, watchedToWarehouseId, form]);

  const { data: levelData, isLoading: levelLoading } = useInventoryLevels(
    {
      productId: watchedProductId,
      warehouseId: watchedFromWarehouseId,
      page: 1,
      pageSize: 1,
    },
    { enabled: !!watchedProductId && !!watchedFromWarehouseId }
  );

  const availableStock = levelData?.items?.[0]?.quantityAvailable;

  const onSubmit = async (data: CreateStockTransferFormData) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
      router.push("/inventory/stock-transfers");
    } catch {
      // Error handled via mutation state
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {isEdit
            ? t("stockTransfer.editTitle")
            : t("stockTransfer.createTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <p>
              {t("common.error")}:{" "}
              {(error as AxiosError<ApiResponse<unknown>>)?.response?.data
                ?.message || error.message}
            </p>
          </Alert>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fromWarehouseId">
              {t("stockTransfer.fromWarehouse")} *
            </Label>
            <Select
              id="fromWarehouseId"
              {...form.register("fromWarehouseId")}
              options={warehouseOptions}
              placeholder={t("stockTransfer.selectSourceWarehouse")}
              className="h-10"
            />
            {form.formState.errors.fromWarehouseId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.fromWarehouseId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="toWarehouseId">
              {t("stockTransfer.toWarehouse")} *
            </Label>
            <Select
              id="toWarehouseId"
              {...form.register("toWarehouseId")}
              options={toWarehouseOptions}
              placeholder={t("stockTransfer.selectDestinationWarehouse")}
              className="h-10"
            />
            {form.formState.errors.toWarehouseId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.toWarehouseId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="productId">{t("stockTransfer.product")} *</Label>
            <Select
              id="productId"
              {...form.register("productId")}
              options={productOptions}
              placeholder={t("stockTransfer.selectProduct")}
              className="h-10"
            />
            {form.formState.errors.productId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.productId.message}
              </p>
            )}
          </div>

          {watchedProductId && watchedFromWarehouseId && levelLoading && (
            <div className="flex h-10 items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("stockTransfer.loadingAvailableStock")}
            </div>
          )}

          {!levelLoading &&
            availableStock !== undefined &&
            watchedProductId &&
            watchedFromWarehouseId && (
              <div className="rounded-md bg-muted px-4 py-3 text-sm">
                <span className="text-muted-foreground">
                  {t("stockTransfer.availableStock")}:{" "}
                </span>
                <span className="font-semibold tabular-nums">
                  {availableStock}
                </span>
              </div>
            )}

          <div className="space-y-2">
            <Label htmlFor="quantity">{t("stockTransfer.quantity")} *</Label>
            <Input
              id="quantity"
              type="number"
              step="0.001"
              min="0"
              {...form.register("quantity", { valueAsNumber: true })}
              placeholder="1"
              className="h-10"
            />
            {form.formState.errors.quantity && (
              <p className="text-sm text-destructive">
                {form.formState.errors.quantity.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("stockTransfer.notes")}</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder={t("stockTransfer.notesPlaceholder")}
              rows={3}
            />
            {form.formState.errors.notes && (
              <p className="text-sm text-destructive">
                {form.formState.errors.notes.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? t("common.executing") : t("common.save")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}