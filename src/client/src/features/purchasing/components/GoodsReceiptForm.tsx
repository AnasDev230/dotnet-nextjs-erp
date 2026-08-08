"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import {
  goodsReceiptFormSchema,
  type GoodsReceiptFormData,
  type GrnItemFormData,
} from "../schemas/goods-receipt.schema";
import { useCreateGoodsReceipt } from "../hooks/useCreateGoodsReceipt";
import { usePurchaseOrders } from "../hooks/usePurchaseOrders";
import { usePurchaseOrder } from "../hooks/usePurchaseOrder";
import { useWarehousesForDropdown } from "@/features/inventory/hooks/useWarehousesForDropdown";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";

function todayString(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

export default function GoodsReceiptForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createMutation = useCreateGoodsReceipt();
  const isPending = createMutation.isPending;
  const error = createMutation.error;

  const { data: ordersData } = usePurchaseOrders({
    page: 1,
    pageSize: 1000,
  });
  const { data: warehouses } = useWarehousesForDropdown();

  const form = useForm<GoodsReceiptFormData>({
    resolver: zodResolver(goodsReceiptFormSchema) as Resolver<GoodsReceiptFormData>,
    defaultValues: {
      purchaseOrderId: searchParams.get("orderId") ?? "",
      receiptDate: todayString(),
      warehouseId: "",
      notes: "",
      items: [],
    },
  });

  const watchedOrderId = form.watch("purchaseOrderId");

  const { data: order } = usePurchaseOrder(watchedOrderId || undefined);

  const orderOptions = useMemo(
    () =>
      (ordersData?.items ?? [])
        .filter(
          (o) => o.status === "Approved" || o.status === "PartiallyReceived"
        )
        .map((o) => ({
          value: o.id,
          label: `${o.poNumber} — ${o.supplierName}`,
        })),
    [ordersData]
  );

  const warehouseOptions = useMemo(
    () =>
      (warehouses ?? []).map((warehouse) => ({
        value: warehouse.id,
        label: `${warehouse.code} — ${warehouse.name}`,
      })),
    [warehouses]
  );

  const [selectedKeys, setSelectedKeys] = useState<Record<string, number>>({});

  const selectableLines = useMemo(
    () =>
      (order?.items ?? []).filter(
        (item) => item.remainingQty > 0 && item.productId
      ),
    [order]
  );

  // Keep the form's items field in sync with the checked lines so the zod
  // schema (items min 1, unique poItemId) validates correctly.
  useEffect(() => {
    const items: GrnItemFormData[] = selectableLines
      .filter((line) => selectedKeys[line.id] !== undefined)
      .map((line) => ({
        poItemId: line.id,
        productId: line.productId,
        quantity: selectedKeys[line.id] ?? line.remainingQty,
      }));
    form.setValue("items", items, { shouldValidate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectableLines, selectedKeys]);

  const getErrorMessage = (): string | null => {
    if (!error) return null;
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    return axiosError.response?.data?.message || error.message;
  };

  const toggleLine = (itemId: string, maxQty: number) => {
    setSelectedKeys((prev) => {
      const next = { ...prev };
      if (next[itemId] !== undefined) {
        delete next[itemId];
      } else {
        next[itemId] = maxQty;
      }
      return next;
    });
  };

  const updateQty = (itemId: string, qty: number) => {
    setSelectedKeys((prev) => ({ ...prev, [itemId]: qty }));
  };

  const onSubmit = async (data: GoodsReceiptFormData) => {
    const payload = {
      purchaseOrderId: data.purchaseOrderId,
      receiptDate: data.receiptDate,
      warehouseId: data.warehouseId,
      notes: data.notes || undefined,
      items: data.items.map((item) => ({
        poItemId: item.poItemId,
        productId: item.productId,
        quantity: Number(item.quantity),
      })),
    };

    try {
      const created = await createMutation.mutateAsync(payload);
      router.push(`/purchasing/receipts/${created.id}`);
    } catch {
      // Error handled via mutation state
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">استلام بضاعة جديد</CardTitle>
        <p className="text-sm text-muted-foreground">
          استلم بضاعة من أمر شراء معتمد
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
            <div className="space-y-2">
              <Label htmlFor="purchaseOrderId">أمر الشراء *</Label>
              <Select
                id="purchaseOrderId"
                {...form.register("purchaseOrderId")}
                options={orderOptions}
                placeholder="اختر أمر الشراء"
                className="h-10"
              />
              {form.formState.errors.purchaseOrderId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.purchaseOrderId.message}
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
              <Label htmlFor="receiptDate">تاريخ الاستلام *</Label>
              <Input
                id="receiptDate"
                type="date"
                {...form.register("receiptDate")}
                className="h-10"
              />
              {form.formState.errors.receiptDate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.receiptDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder="ملاحظات اختيارية..."
            />
          </div>

          {watchedOrderId && (
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  بنود أمر الشراء — اختر الكميات المستلمة
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order && selectableLines.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المنتج</TableHead>
                        <TableHead>الكمية المطلوبة</TableHead>
                        <TableHead>المتبقي</TableHead>
                        <TableHead className="text-left">الكمية المستلمة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectableLines.map((item) => {
                        const selected =
                          selectedKeys[item.id] !== undefined;
                        const qty = selectedKeys[item.id] ?? item.remainingQty;
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="font-medium">
                                {item.productName}
                              </div>
                              <div className="text-xs text-muted-foreground font-mono">
                                {item.productSku}
                              </div>
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.remainingQty}</TableCell>
                            <TableCell className="text-left">
                              <div className="flex items-center gap-2 justify-end">
                                <Input
                                  type="number"
                                  min={0}
                                  max={item.remainingQty}
                                  step="0.001"
                                  disabled={!selected}
                                  value={qty}
                                  onChange={(e) =>
                                    updateQty(item.id, Number(e.target.value))
                                  }
                                  className="h-9 w-28"
                                />
                                <Button
                                  type="button"
                                  variant={
                                    selected ? "default" : "outline"
                                  }
                                  size="sm"
                                  className="h-9"
                                  onClick={() =>
                                    toggleLine(item.id, item.remainingQty)
                                  }
                                >
                                  {selected ? "إلغاء" : "تحديد"}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 ml-2" />
                    {order
                      ? "لا توجد بنود متبقية للاستلام في هذا الأمر"
                      : "لم يتم العثور على أمر الشراء"}
                  </div>
                )}

                {form.formState.errors.items && (
                  <p className="mt-3 text-sm text-destructive">
                    {form.formState.errors.items.message}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={isPending || !watchedOrderId}>
              {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              تسجيل الاستلام
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
