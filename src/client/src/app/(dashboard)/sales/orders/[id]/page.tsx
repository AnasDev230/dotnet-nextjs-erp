"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Pencil, Loader2 } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Label,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import { useSalesOrder } from "@/features/sales/hooks/useSalesOrder";
import { useTranslation } from "@/hooks/use-translation";
import type { SalesOrderStatus } from "@/features/sales/types/sales-order.types";

const statusBadgeVariant: Record<
  SalesOrderStatus,
  "secondary" | "success" | "destructive"
> = {
  Draft: "secondary",
  Confirmed: "success",
  Cancelled: "destructive",
};

const statusLabelKey: Record<SalesOrderStatus, string> = {
  Draft: "sales.orders.draft",
  Confirmed: "sales.orders.confirmed",
  Cancelled: "sales.orders.cancelled",
};

function formatCurrency(value: number): string {
  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ر.س`;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("ar-SA");
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

export default function SalesOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { data: order, isLoading, error } = useSalesOrder(params.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{t("sales.orders.notFound")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("sales.orders.notFoundDescription")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              {t("sales.orders.detailTitle")} {order.orderNumber}
            </h1>
            <p className="text-muted-foreground text-sm">{t("sales.orders.details")}</p>
          </div>
        </div>
        <Link href={`/sales/orders/${order.id}/edit`}>
          <Button className="gap-2">
            <Pencil className="h-4 w-4" />
            {t("common.edit")}
          </Button>
        </Link>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("sales.orders.orderInfo")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoRow label={t("sales.orders.orderNumber")} value={order.orderNumber} />
            <InfoRow label={t("sales.orders.customer")} value={order.customerName} />
            <InfoRow label={t("purchasing.receipts.warehouse")} value={order.warehouseName || "—"} />
            <InfoRow label={t("sales.orders.orderDate")} value={formatDate(order.orderDate)} />
            <InfoRow
              label={t("sales.orders.deliveryDate")}
              value={order.deliveryDate ? formatDate(order.deliveryDate) : "—"}
            />
            <InfoRow
              label={t("common.status")}
              value={
                <Badge variant={statusBadgeVariant[order.status]}>
                  {t(statusLabelKey[order.status])}
                </Badge>
              }
            />
            <InfoRow
              label={t("common.createdAt")}
              value={formatDate(order.createdAt)}
            />
            <InfoRow
              label={t("sales.orders.taxRate")}
              value={
                order.taxRateName
                  ? `${order.taxRateName} (${order.taxPct}%)`
                  : "—"
              }
            />
          </div>
          {order.notes && (
            <div className="mt-4 space-y-1">
              <Label className="text-xs text-muted-foreground">{t("common.notes")}</Label>
              <p className="text-sm">{order.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("sales.orders.orderItems")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t("sales.orders.product")}</TableHead>
                <TableHead>{t("common.quantity")}</TableHead>
                <TableHead>{t("sales.orders.unitPrice")}</TableHead>
                <TableHead>{t("sales.orders.discount")} %</TableHead>
                <TableHead className="text-end">{t("sales.orders.lineTotal")}</TableHead>
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
                  <TableCell className="text-muted-foreground tabular-nums">
                    {formatCurrency(item.unitPrice)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {item.discountPct > 0 ? `${item.discountPct}%` : "—"}
                  </TableCell>
                  <TableCell className="text-end font-medium tabular-nums">
                    {formatCurrency(item.lineTotal)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("sales.orders.itemsCount")}</span>
                <span>{order.items.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>{t("sales.orders.subtotal")}</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>
                  {t("sales.orders.discount")}
                  {order.discountPct > 0 && (
                    <span className="text-muted-foreground">
                      {" "}
                      ({order.discountPct}%)
                    </span>
                  )}
                </span>
                <span className="text-destructive">
                  {order.discountAmount > 0
                    ? `-${formatCurrency(order.discountAmount)}`
                    : formatCurrency(order.discountAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>{t("sales.orders.taxable")}</span>
                <span>{formatCurrency(order.subtotal - order.discountAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>
                  {t("sales.orders.tax")}
                  {order.taxRateName && order.taxPct > 0 && (
                    <span className="text-muted-foreground">
                      {" "}
                      ({order.taxRateName} {order.taxPct}%)
                    </span>
                  )}
                </span>
                <span>
                  {order.taxAmount > 0
                    ? `+${formatCurrency(order.taxAmount)}`
                    : formatCurrency(order.taxAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-2 text-base font-semibold">
                <span>{t("sales.orders.grandTotal")}</span>
                <span className="text-primary">
                  {formatCurrency(order.netAmount)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
