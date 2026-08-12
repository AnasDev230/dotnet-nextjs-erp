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
import { useTranslation } from "@/hooks/use-translation";
import { formatCurrency, formatDate } from "@/lib/formatters";

function todayString(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
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
  const { t, language } = useTranslation();
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
        label: `${o.orderNumber} — ${o.customerName} (${formatCurrency(o.netAmount, language)})`,
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
        <CardTitle className="text-lg">{t("finance.invoices.createTitle")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("finance.invoices.createSubtitle")}
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
              <Label htmlFor="orderId">{t("finance.invoices.confirmedOrder")} *</Label>
              <Select
                id="orderId"
                {...form.register("orderId")}
                options={orderOptions}
                placeholder={t("finance.invoices.selectOrder")}
                className="h-10"
              />
              {form.formState.errors.orderId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.orderId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="issueDate">{t("finance.invoices.issueDate")} *</Label>
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
                <CardTitle className="text-lg">{t("finance.invoices.orderSummary")}</CardTitle>
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
                          {t("finance.invoices.customer")}
                        </Label>
                        <div className="mt-1 text-sm font-medium">
                          {order.customerName}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          {t("finance.invoices.orderDate")}
                        </Label>
                        <div className="mt-1 text-sm font-medium">
                          {formatDate(order.orderDate, language)}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          {t("finance.invoices.expectedDueDate")}
                        </Label>
                        <div className="mt-1 text-sm font-medium">
                          {dueDate
                            ? formatDate(`${dueDate}T00:00:00`, language)
                            : "—"}
                          {paymentTerms > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {" "}
                              ({t("finance.invoices.paymentTerms")}: {paymentTerms} {t("common.days")})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead>{t("finance.invoices.product")}</TableHead>
                          <TableHead>{t("finance.invoices.quantity")}</TableHead>
                          <TableHead>{t("finance.invoices.unitPrice")}</TableHead>
                          <TableHead className="text-end">{t("finance.invoices.total")}</TableHead>
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
                            <TableCell className="tabular-nums">{item.quantity}</TableCell>
                            <TableCell className="text-muted-foreground tabular-nums">
                              {formatCurrency(item.unitPrice, language)}
                            </TableCell>
                            <TableCell className="text-end font-medium tabular-nums">
                              {formatCurrency(item.lineTotal, language)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <div className="flex justify-end">
                      <div className="w-full max-w-xs space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {t("finance.invoices.subtotal")}
                          </span>
                          <span>{formatCurrency(order.subtotal, language)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{t("finance.invoices.discount")}</span>
                          <span className="text-destructive">
                            {order.discountAmount > 0
                              ? `-${formatCurrency(order.discountAmount, language)}`
                              : formatCurrency(order.discountAmount, language)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{t("finance.invoices.tax")}</span>
                          <span>
                            {order.taxAmount > 0
                              ? `+${formatCurrency(order.taxAmount, language)}`
                              : formatCurrency(order.taxAmount, language)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-border pt-2 text-base font-semibold">
                          <span>{t("finance.invoices.finalTotal")}</span>
                          <span className="text-primary">
                            {formatCurrency(order.netAmount, language)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    {t("finance.invoices.orderNotFound")}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={isPending || !watchedOrderId} className="gap-2">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("finance.invoices.createButton")}
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
