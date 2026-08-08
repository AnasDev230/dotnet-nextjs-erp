"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, Pencil, AlertCircle } from "lucide-react";
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
import { usePurchaseOrder } from "../hooks/usePurchaseOrder";
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
            <h1 className="text-2xl font-semibold">أمر الشراء غير موجود</h1>
            <p className="text-muted-foreground text-sm">
              لم يتم العثور على أمر الشراء المطلوب
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

  const canEdit =
    order.status === "Draft" || order.status === "Submitted";

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
            <p className="text-muted-foreground text-sm">تفاصيل أمر الشراء</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link href={`/purchasing/orders/${order.id}/edit`}>
              <Button variant="outline">
                <Pencil className="ml-2 h-4 w-4" />
                تعديل
              </Button>
            </Link>
          )}
          <Link href={`/purchasing/receipts/new?orderId=${order.id}`}>
            <Button disabled={order.status !== "Approved" && order.status !== "PartiallyReceived"}>
              تسجيل استلام
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">بيانات الأمر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoRow label="المورد" value={order.supplierName} />
            <InfoRow label="تاريخ الأمر" value={formatDate(order.orderDate)} />
            <InfoRow
              label="تاريخ التوقع"
              value={order.expectedDate ? formatDate(order.expectedDate) : "—"}
            />
            <InfoRow label="العملة" value={order.currency} />
            <InfoRow
              label="الحالة"
              value={<PurchaseOrderStatusBadge status={order.status} />}
            />
            <InfoRow label="إجمالي الأمر" value={formatCurrency(order.totalAmount, order.currency)} />
            {order.approvedByName && (
              <InfoRow
                label="المعتمد"
                value={`${order.approvedByName}${order.approvedAt ? ` (${new Date(order.approvedAt).toLocaleDateString("ar-SA")})` : ""}`}
              />
            )}
            {order.terms && (
              <InfoRow label="الشروط" value={order.terms} />
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">بنود الأمر</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المنتج</TableHead>
                <TableHead>الكمية</TableHead>
                <TableHead>المستلم</TableHead>
                <TableHead>المتبقي</TableHead>
                <TableHead>سعر الوحدة</TableHead>
                <TableHead className="text-left">الإجمالي</TableHead>
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
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.receivedQty}</TableCell>
                  <TableCell>{item.remainingQty}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatCurrency(item.unitPrice, order.currency)}
                  </TableCell>
                  <TableCell className="text-left font-medium">
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
          هذا الأمر ما زال مسودة ولم يُعتمد بعد.
        </div>
      )}
    </div>
  );
}
