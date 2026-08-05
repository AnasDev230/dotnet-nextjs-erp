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
  createInvoiceSchema,
  type CreateInvoiceFormData,
} from "../schemas/invoice.schema";
import { useCreateInvoice } from "../hooks/useInvoices";
import { useSalesOrders } from "@/features/sales/hooks/useSalesOrders";
import { useSalesOrder } from "@/features/sales/hooks/useSalesOrder";
import { useCustomer } from "@/features/sales/hooks/useCustomer";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";

function todayString(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

function formatCurrency(value: number): string {
  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ر.س`;
}

function addDays(dateString: string, days: number): string {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

export default function InvoiceForm() {
  const router = useRouter();
  const createMutation = useCreateInvoice();
  const isPending = createMutation.isPending;
  const error = createMutation.error;

  const { data: confirmedOrdersData } = useSalesOrders({
    page: 1,
    pageSize: 1000,
    status: "Confirmed",
  });

  const form = useForm<CreateInvoiceFormData>({
    resolver: zodResolver(createInvoiceSchema) as Resolver<CreateInvoiceFormData>,
    defaultValues: {
      orderId: "",
      issueDate: todayString(),
    },
  });

  const watchedOrderId = form.watch("orderId");
  const watchedIssueDate = form.watch("issueDate");

  const { data: order, isLoading: isOrderLoading } = useSalesOrder(
    watchedOrderId || undefined
  );

  const { data: customer } = useCustomer(order?.customerId || undefined);

  const orderOptions = useMemo(
    () =>
      (confirmedOrdersData?.items ?? []).map((o) => ({
        value: o.id,
        label: `${o.orderNumber} — ${o.customerName} (${formatCurrency(o.netAmount)})`,
      })),
    [confirmedOrdersData]
  );

  const paymentTerms = customer?.paymentTerms ?? 0;
  const dueDate =
    watchedOrderId && watchedIssueDate && paymentTerms > 0
      ? addDays(watchedIssueDate, paymentTerms)
      : watchedOrderId && watchedIssueDate
        ? watchedIssueDate
        : null;

  const getErrorMessage = (): string | null => {
    if (!error) return null;
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    return axiosError.response?.data?.message || error.message;
  };

  const onSubmit = async (data: CreateInvoiceFormData) => {
    try {
      const created = await createMutation.mutateAsync(data);
      router.push(`/finance/invoices/${created.id}`);
    } catch {
      // Error handled via mutation state
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">فاتورة جديدة</CardTitle>
        <p className="text-sm text-muted-foreground">
          أنشئ فاتورة من أمر بيع مؤكد
        </p>
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
              <Label htmlFor="orderId">أمر البيع المؤكد *</Label>
              <Select
                id="orderId"
                {...form.register("orderId")}
                options={orderOptions}
                placeholder="اختر أمر البيع"
                className="h-10"
              />
              {form.formState.errors.orderId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.orderId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="issueDate">تاريخ الإصدار *</Label>
              <Input
                id="issueDate"
                type="date"
                {...form.register("issueDate")}
                className="h-10"
              />
              {form.formState.errors.issueDate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.issueDate.message}
                </p>
              )}
            </div>
          </div>

          {watchedOrderId && (
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">ملخص أمر البيع</CardTitle>
              </CardHeader>
              <CardContent>
                {isOrderLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : order ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          العميل
                        </Label>
                        <div className="mt-1 text-sm font-medium">
                          {order.customerName}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          تاريخ الأمر
                        </Label>
                        <div className="mt-1 text-sm font-medium">
                          {order.orderDate}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          تاريخ الاستحقاق المتوقع
                        </Label>
                        <div className="mt-1 text-sm font-medium">
                          {dueDate
                            ? new Date(`${dueDate}T00:00:00`).toLocaleDateString(
                                "ar-SA"
                              )
                            : "—"}
                          {paymentTerms > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {" "}
                              (شروط السداد: {paymentTerms} يوم)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>المنتج</TableHead>
                          <TableHead>الكمية</TableHead>
                          <TableHead>سعر الوحدة</TableHead>
                          <TableHead className="text-left">الإجمالي</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items.map((item) => (
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
                            <TableCell className="text-muted-foreground">
                              {formatCurrency(item.unitPrice)}
                            </TableCell>
                            <TableCell className="text-left font-medium">
                              {formatCurrency(item.lineTotal)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <div className="flex justify-end">
                      <div className="w-full max-w-xs space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            المجموع الفرعي
                          </span>
                          <span>{formatCurrency(order.subtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">الخصم</span>
                          <span className="text-destructive">
                            {order.discountAmount > 0
                              ? `-${formatCurrency(order.discountAmount)}`
                              : formatCurrency(order.discountAmount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">الضريبة</span>
                          <span>
                            {order.taxAmount > 0
                              ? `+${formatCurrency(order.taxAmount)}`
                              : formatCurrency(order.taxAmount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-border pt-2 text-base font-semibold">
                          <span>الإجمالي النهائي</span>
                          <span className="text-primary">
                            {formatCurrency(order.netAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 ml-2" />
                    لم يتم العثور على أمر البيع
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={isPending || !watchedOrderId}>
              {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              إنشاء الفاتورة
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
