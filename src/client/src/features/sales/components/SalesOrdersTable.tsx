"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Trash2, ShoppingCart } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Badge,
} from "@/components/ui";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useDeleteSalesOrder } from "../hooks/useDeleteSalesOrder";
import type {
  SalesOrderListItem,
  SalesOrderStatus,
} from "../types/sales-order.types";

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

interface SalesOrdersTableProps {
  orders: SalesOrderListItem[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function SalesOrdersTable({
  orders,
  isLoading,
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
}: SalesOrdersTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const deleteMutation = useDeleteSalesOrder();

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        setDeleteId(null);
        setErrorMessage(null);
      },
      onError: (error: any) => {
        setErrorMessage(
          error?.response?.data?.message ||
            error?.message ||
            "حدث خطأ غير متوقع"
        );
      },
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم الأمر</TableHead>
              <TableHead>العميل</TableHead>
              <TableHead>المستودع</TableHead>
              <TableHead>تاريخ الأمر</TableHead>
              <TableHead>عدد المنتجات</TableHead>
              <TableHead>صافي المبلغ</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 8 }).map((_, j) => (
                  <TableCell key={j}>
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-border">
        <div className="rounded-full bg-muted p-4 mb-4">
          <ShoppingCart className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">لا توجد أوامر بيع</h3>
        <p className="text-sm text-muted-foreground mb-4">
          لم يتم إضافة أي أوامر بيع بعد
        </p>
        <Link href="/sales/orders/new">
          <Button>
            <ShoppingCart className="ml-2 h-4 w-4" />
            أمر بيع جديد
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم الأمر</TableHead>
              <TableHead>العميل</TableHead>
              <TableHead>المستودع</TableHead>
              <TableHead>تاريخ الأمر</TableHead>
              <TableHead>عدد المنتجات</TableHead>
              <TableHead>صافي المبلغ</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium font-mono text-xs">
                  {order.orderNumber}
                </TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {order.warehouseName}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {new Date(`${order.orderDate}T00:00:00`).toLocaleDateString(
                    "ar-SA"
                  )}
                </TableCell>
                <TableCell>{order.itemsCount}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatCurrency(order.netAmount)}
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant[order.status]}>
                    {statusLabel[order.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-left">
                  <div className="flex items-center gap-1">
                    <Link href={`/sales/orders/${order.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/sales/orders/${order.id}/edit`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        setErrorMessage(null);
                        setDeleteId(order.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            عرض {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, totalCount)} من {totalCount}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              السابق
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              التالي
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteId(null);
            setErrorMessage(null);
          }
        }}
        title="حذف أمر البيع"
        description="هل أنت متأكد من حذف أمر البيع؟ لا يمكن حذف الأوامر المؤكدة أو الملغاة. لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف"
        variant="danger"
        isLoading={deleteMutation.isPending}
        errorMessage={errorMessage}
        onConfirm={handleDelete}
      />
    </>
  );
}
