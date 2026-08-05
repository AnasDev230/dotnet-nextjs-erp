"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import { OrderStatusBadge } from "@/features/sales/components/OrderStatusBadge";
import type { RecentOrder } from "@/types/dashboard";

function formatCurrency(value: number): string {
  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ر.س`;
}

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("ar-SA");
}

interface RecentOrdersTableProps {
  orders: RecentOrder[] | undefined;
  isLoading: boolean;
}

export default function RecentOrdersTable({
  orders,
  isLoading,
}: RecentOrdersTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">أحدث أوامر البيع</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم الأمر</TableHead>
              <TableHead>العميل</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>المبلغ</TableHead>
              <TableHead>الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <TableCell key={j}>
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">أحدث أوامر البيع</CardTitle>
        </CardHeader>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="mb-3 rounded-full bg-muted p-3">
            <ShoppingCart className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">لا توجد أوامر بيع بعد</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">أحدث أوامر البيع</CardTitle>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>رقم الأمر</TableHead>
            <TableHead>العميل</TableHead>
            <TableHead>التاريخ</TableHead>
            <TableHead>المبلغ</TableHead>
            <TableHead>الحالة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <Link
                  href={`/sales/orders/${order.id}`}
                  className="font-mono text-xs font-medium text-primary hover:underline"
                >
                  {order.orderNumber}
                </Link>
              </TableCell>
              <TableCell>{order.customerName}</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatDate(order.orderDate)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatCurrency(order.netAmount)}
              </TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
