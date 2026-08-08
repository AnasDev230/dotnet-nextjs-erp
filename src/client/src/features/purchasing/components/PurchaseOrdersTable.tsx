"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Trash2, ShoppingCart } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
} from "@/components/ui";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PurchaseOrderStatusBadge } from "./PurchaseOrderStatusBadge";
import { useDeletePurchaseOrder } from "../hooks/useDeletePurchaseOrder";
import type { PurchaseOrderListItem } from "../types/purchase-order.types";

function formatCurrency(value: number, currency: string = "ر.س"): string {
  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("ar-SA");
}

interface PurchaseOrdersTableProps {
  orders: PurchaseOrderListItem[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function PurchaseOrdersTable({
  orders,
  isLoading,
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
}: PurchaseOrdersTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const deleteMutation = useDeletePurchaseOrder();

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
              <TableHead>المورد</TableHead>
              <TableHead>تاريخ الأمر</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">الإجمالي</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 6 }).map((_, j) => (
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
        <h3 className="text-lg font-semibold mb-1">لا توجد أوامر شراء</h3>
        <p className="text-sm text-muted-foreground mb-4">
          لم يتم إنشاء أي أوامر شراء بعد
        </p>
        <Link href="/purchasing/orders/new">
          <Button>
            <ShoppingCart className="ml-2 h-4 w-4" />
            أمر شراء جديد
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
              <TableHead>المورد</TableHead>
              <TableHead>تاريخ الأمر</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">الإجمالي</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium font-mono text-xs">
                  {order.poNumber}
                </TableCell>
                <TableCell>{order.supplierName}</TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {formatDate(order.orderDate)}
                </TableCell>
                <TableCell>
                  <PurchaseOrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-left font-mono text-xs">
                  {formatCurrency(order.totalAmount)}
                </TableCell>
                <TableCell className="text-left">
                  <div className="flex items-center gap-1">
                    <Link href={`/purchasing/orders/${order.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    {(order.status === "Draft" ||
                      order.status === "Submitted") && (
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
                    )}
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
        title="حذف أمر الشراء"
        description="هل أنت متأكد من حذف أمر الشراء؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف"
        variant="danger"
        isLoading={deleteMutation.isPending}
        errorMessage={errorMessage}
        onConfirm={handleDelete}
      />
    </>
  );
}
