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
import type { SalesOrderStatus } from "@/features/sales/types/sales-order.types";

const statusBadgeVariant: Record<
  SalesOrderStatus,
  "secondary" | "success" | "destructive"
> = {
  Draft: "secondary",
  Confirmed: "success",
  Cancelled: "destructive",
};

const statusLabel: Record<SalesOrderStatus, string> = {
  Draft: "مسودة",
  Confirmed: "مؤكد",
  Cancelled: "ملغي",
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
            <h1 className="text-2xl font-semibold">أمر البيع غير موجود</h1>
            <p className="text-muted-foreground text-sm">
              لم يتم العثور على أمر البيع المطلوب
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
              أمر البيع {order.orderNumber}
            </h1>
            <p className="text-muted-foreground text-sm">تفاصيل أمر البيع</p>
          </div>
        </div>
        <Link href={`/sales/orders/${order.id}/edit`}>
          <Button>
            <Pencil className="ml-2 h-4 w-4" />
            تعديل
          </Button>
        </Link>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">بيانات الأمر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoRow label="رقم الأمر" value={order.orderNumber} />
            <InfoRow label="العميل" value={order.customerName} />
            <InfoRow label="تاريخ الأمر" value={formatDate(order.orderDate)} />
            <InfoRow
              label="تاريخ التسليم"
              value={order.deliveryDate ? formatDate(order.deliveryDate) : "—"}
            />
            <InfoRow
              label="الحالة"
              value={
                <Badge variant={statusBadgeVariant[order.status]}>
                  {statusLabel[order.status]}
                </Badge>
              }
            />
            <InfoRow
              label="تاريخ الإنشاء"
              value={formatDate(order.createdAt)}
            />
          </div>
          {order.notes && (
            <div className="mt-4 space-y-1">
              <Label className="text-xs text-muted-foreground">ملاحظات</Label>
              <p className="text-sm">{order.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">منتجات الأمر</CardTitle>
        </CardHeader>
        <CardContent>
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
                    <div className="font-medium">{item.productName}</div>
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

          <div className="mt-4 flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">عدد المنتجات</span>
                <span>{order.items.length}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-2 text-base font-semibold">
                <span>الإجمالي النهائي</span>
                <span className="text-primary">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
