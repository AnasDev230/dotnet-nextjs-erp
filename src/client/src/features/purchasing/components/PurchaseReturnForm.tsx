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
  purchaseReturnFormSchema,
  type PurchaseReturnFormData,
} from "../schemas/purchase-return.schema";
import { useCreatePurchaseReturn } from "../hooks/usePurchaseReturns";
import { useGoodsReceipts } from "../hooks/useGoodsReceipts";
import { useGoodsReceipt } from "../hooks/useGoodsReceipt";
import { usePurchaseOrder } from "../hooks/usePurchaseOrder";
import { useWarehousesForDropdown } from "@/features/inventory/hooks/useWarehousesForDropdown";
import PurchaseReturnItemsEditor from "./PurchaseReturnItemsEditor";
import type { PoItemResponse } from "../types/purchase-order.types";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";
import { useTranslation } from "@/hooks/use-translation";

function todayString(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

export default function PurchaseReturnForm() {
  const router = useRouter();
  const { t } = useTranslation();

  const createMutation = useCreatePurchaseReturn();
  const isPending = createMutation.isPending;
  const error = createMutation.error;

  const { data: warehouses } = useWarehousesForDropdown();
  const { data: receiptsData } = useGoodsReceipts({ page: 1, pageSize: 1000 });

  const eligibleReceipts = useMemo(
    () => (receiptsData?.items ?? []).filter((receipt) => receipt.status === "Received"),
    [receiptsData]
  );

  const receiptOptions = useMemo(
    () =>
      eligibleReceipts.map((receipt) => ({
        value: receipt.id,
        label: `${receipt.grnNumber} — ${receipt.supplierName}`,
      })),
    [eligibleReceipts]
  );

  const warehouseOptions = useMemo(
    () =>
      (warehouses ?? []).map((warehouse) => ({
        value: warehouse.id,
        label: `${warehouse.code} — ${warehouse.name}`,
      })),
    [warehouses]
  );

  const form = useForm<PurchaseReturnFormData>({
    resolver: zodResolver(purchaseReturnFormSchema) as Resolver<PurchaseReturnFormData>,
    defaultValues: {
      goodsReceiptId: "",
      supplierId: "",
      warehouseId: "",
      returnDate: todayString(),
      reason: "",
      items: [],
    },
  });

  const watchedReceiptId = form.watch("goodsReceiptId");

  const { data: receipt, isLoading: isReceiptLoading } = useGoodsReceipt(
    watchedReceiptId || undefined
  );

  const { data: purchaseOrder, isLoading: isOrderLoading } = usePurchaseOrder(
    receipt?.purchaseOrderId || undefined
  );

  const orderItems: PoItemResponse[] = purchaseOrder?.items ?? [];

  const unitCostByProduct = useMemo(() => {
    const map = new Map<string, number>();
    orderItems.forEach((item) => {
      if (item.productId) map.set(item.productId, item.unitPrice);
    });
    return map;
  }, [orderItems]);

  useEffect(() => {
    if (purchaseOrder?.supplierId) {
      form.setValue("supplierId", purchaseOrder.supplierId);
    }
  }, [purchaseOrder, form]);

  useEffect(() => {
    if (receipt?.warehouseId) {
      form.setValue("warehouseId", receipt.warehouseId);
    }
  }, [receipt, form]);

  useEffect(() => {
    if (!watchedReceiptId) {
      form.setValue("supplierId", "");
      form.setValue("warehouseId", "");
      form.setValue("items", []);
    }
  }, [watchedReceiptId, form]);

  const getErrorMessage = (): string | null => {
    if (!error) return null;
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    return axiosError.response?.data?.message || error.message;
  };

  const onSubmit = async (data: PurchaseReturnFormData) => {
    const items = data.items.map((item) => ({
      productId: item.productId,
      quantity: Number(item.quantity),
      unitCost: Number(item.unitCost),
      reason: item.reason || undefined,
    }));

    try {
      const created = await createMutation.mutateAsync({
        goodsReceiptId: data.goodsReceiptId,
        supplierId: data.supplierId,
        warehouseId: data.warehouseId,
        returnDate: data.returnDate,
        reason: data.reason || undefined,
        items,
      });
      router.push(`/purchasing/returns/${created.id}`);
    } catch {
      // Error handled via mutation state
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{t("returns.new.purchase")}</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <p>{getErrorMessage()}</p>
          </Alert>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <input type="hidden" {...form.register("supplierId")} />

          <div className="grid gap-4 md:grid-cols-2">
            {/* Goods Receipt */}
            <div className="space-y-2">
              <Label htmlFor="goodsReceiptId">{t("returns.goodsReceipt")} *</Label>
              <Select
                id="goodsReceiptId"
                {...form.register("goodsReceiptId")}
                options={receiptOptions}
                placeholder={t("returns.selectGoodsReceipt")}
                className="h-10"
              />
              {form.formState.errors.goodsReceiptId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.goodsReceiptId.message}
                </p>
              )}
              {isReceiptLoading && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {t("returns.loadingGoodsReceipt")}
                </p>
              )}
            </div>

            {/* Supplier (auto-filled from receipt's PO) */}
            <div className="space-y-2">
              <Label htmlFor="supplier">{t("returns.supplier")}</Label>
              <div
                id="supplier"
                className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm"
              >
                {purchaseOrder?.supplierName ?? "—"}
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
          <PurchaseReturnItemsEditor
            control={form.control}
            register={form.register}
            setValue={form.setValue}
            errors={form.formState.errors}
            receiptItems={receipt?.items ?? []}
            unitCostByProduct={unitCostByProduct}
            orderLoading={isOrderLoading || isReceiptLoading}
            itemsAvailable={!!receipt && !!purchaseOrder}
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