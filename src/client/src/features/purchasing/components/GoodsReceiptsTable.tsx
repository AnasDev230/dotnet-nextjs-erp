"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, XCircle, PackageCheck } from "lucide-react";
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
import { GoodsReceiptStatusBadge } from "./GoodsReceiptStatusBadge";
import { useCancelGoodsReceipt } from "../hooks/useCancelGoodsReceipt";
import type { GoodsReceiptListItem } from "../types/goods-receipt.types";

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("ar-SA");
}

interface GoodsReceiptsTableProps {
  receipts: GoodsReceiptListItem[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function GoodsReceiptsTable({
  receipts,
  isLoading,
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
}: GoodsReceiptsTableProps) {
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const cancelMutation = useCancelGoodsReceipt();

  const handleCancel = () => {
    if (!cancelId) return;
    cancelMutation.mutate(cancelId, {
      onSuccess: () => {
        setCancelId(null);
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
              <TableHead>رقم الاستلام</TableHead>
              <TableHead>رقم الأمر</TableHead>
              <TableHead>المورد</TableHead>
              <TableHead>تاريخ الاستلام</TableHead>
              <TableHead>المستودع</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 7 }).map((_, j) => (
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

  if (receipts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-border">
        <div className="rounded-full bg-muted p-4 mb-4">
          <PackageCheck className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">لا توجد عمليات استلام</h3>
        <p className="text-sm text-muted-foreground mb-4">
          لم يتم تسجيل أي استلام بضاعة بعد
        </p>
        <Link href="/purchasing/receipts/new">
          <Button>
            <PackageCheck className="ml-2 h-4 w-4" />
            استلام جديد
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
              <TableHead>رقم الاستلام</TableHead>
              <TableHead>رقم الأمر</TableHead>
              <TableHead>المورد</TableHead>
              <TableHead>تاريخ الاستلام</TableHead>
              <TableHead>المستودع</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.map((receipt) => (
              <TableRow key={receipt.id}>
                <TableCell className="font-medium font-mono text-xs">
                  {receipt.grnNumber}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {receipt.poNumber}
                </TableCell>
                <TableCell>{receipt.supplierName}</TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {formatDate(receipt.receiptDate)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {receipt.warehouseName}
                </TableCell>
                <TableCell>
                  <GoodsReceiptStatusBadge status={receipt.status} />
                </TableCell>
                <TableCell className="text-left">
                  <div className="flex items-center gap-1">
                    <Link href={`/purchasing/receipts/${receipt.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    {receipt.status === "Received" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        title="إلغاء الاستلام"
                        disabled={cancelMutation.isPending}
                        onClick={() => {
                          setErrorMessage(null);
                          setCancelId(receipt.id);
                        }}
                      >
                        <XCircle className="h-4 w-4" />
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
        open={cancelId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCancelId(null);
            setErrorMessage(null);
          }
        }}
        title="إلغاء الاستلام"
        description="سيتم عكس الكميات من المخزون وتراجعها عن أمر الشراء. لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="تأكيد الإلغاء"
        variant="danger"
        isLoading={cancelMutation.isPending}
        errorMessage={errorMessage}
        onConfirm={handleCancel}
      />
    </>
  );
}
