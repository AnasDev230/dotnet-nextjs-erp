"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Alert,
} from "@/components/ui";
import { PurchaseOrderStatusBadge } from "./PurchaseOrderStatusBadge";
import { PurchaseOrderStatusActions } from "./PurchaseOrderStatusActions";
import { usePurchaseOrder } from "../hooks/usePurchaseOrder";
import { useTranslation } from "@/hooks/use-translation";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";

function formatCurrency(value: number, currency: string = "ر.س"): string {
  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("ar-SA");
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

export default function PurchaseOrderDetails({
  orderId,
}: {
  orderId: string;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: order, isLoading, error } = usePurchaseOrder(orderId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !order) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{t("purchasing.orders.notFound")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("purchasing.orders.notFoundDescription")}
            </p>
          </div>
        </div>
        {axiosError?.response?.data?.message && (
          <Alert variant="destructive">
            <p>{axiosError.response.data.message}</p>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              <span className="font-mono">{order.poNumber}</span>
            </h1>
            <p className="text-muted-foreground text-sm">{t("purchasing.orders.details")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PurchaseOrderStatusBadge status={order.status} />
        </div>
      </div>

      <PurchaseOrderStatusActions orderId={order.id} status={order.status} />

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("purchasing.orders.orderInfo")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoRow label={t("purchasing.orders.supplier")} value={order.supplierName} />
            <InfoRow label={t("purchasing.orders.orderDate")} value={formatDate(order.orderDate)} />
            <InfoRow
              label={t("purchasing.orders.expectedDate")}
              value={order.expectedDate ? formatDate(order.expectedDate) : "—"}
            />
            <InfoRow label={t("purchasing.orders.currency")} value={order.currency} />
            <InfoRow
              label={t("common.status")}
              value={<PurchaseOrderStatusBadge status={order.status} />}
            />
            <InfoRow label={t("purchasing.orders.totalAmount")} value={formatCurrency(order.totalAmount, order.currency)} />
            {order.approvedByName && (
              <InfoRow
                label={t("purchasing.orders.approvedBy")}
                value={`${order.approvedByName}${order.approvedAt ? ` (${new Date(order.approvedAt).toLocaleDateString("ar-SA")})` : ""}`}
              />
            )}
            {order.terms && (
              <InfoRow label={t("purchasing.orders.terms")} value={order.terms} />
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("purchasing.orders.items")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t("purchasing.orders.product")}</TableHead>
                <TableHead>{t("common.quantity")}</TableHead>
                <TableHead>{t("purchasing.orders.receivedQty")}</TableHead>
                <TableHead>{t("purchasing.orders.remainingQty")}</TableHead>
                <TableHead>{t("purchasing.orders.unitPrice")}</TableHead>
                <TableHead className="text-end">{t("purchasing.orders.lineTotal")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.productName}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {item.productSku}
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums">{item.quantity}</TableCell>
                  <TableCell className="tabular-nums">{item.receivedQty}</TableCell>
                  <TableCell className="tabular-nums">{item.remainingQty}</TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {formatCurrency(item.unitPrice, order.currency)}
                  </TableCell>
                  <TableCell className="text-end font-medium tabular-nums">
                    {formatCurrency(item.lineTotal, order.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {order.status === "Draft" && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-600">
          <AlertCircle className="h-4 w-4" />
          {t("purchasing.orders.draftWarning")}
        </div>
      )}
    </div>
  );
}
