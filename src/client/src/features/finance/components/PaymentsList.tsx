"use client";

import { useState } from "react";
import { Trash2, Wallet } from "lucide-react";
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
import { usePayments, useDeletePayment } from "../hooks/usePayments";
import type { PaymentMethod } from "../types/payment.types";

const paymentMethodLabel: Record<PaymentMethod, string> = {
  Cash: "نقدي",
  BankTransfer: "تحويل بنكي",
  Card: "بطاقة",
  Cheque: "شيك",
};

function formatCurrency(value: number): string {
  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ر.س`;
}

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("ar-SA");
}

interface PaymentsListProps {
  invoiceId: string;
  canDelete: boolean;
}

export default function PaymentsList({
  invoiceId,
  canDelete,
}: PaymentsListProps) {
  const { data: payments, isLoading } = usePayments(invoiceId);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const deleteMutation = useDeletePayment();

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
              <TableHead>التاريخ</TableHead>
              <TableHead>المبلغ</TableHead>
              <TableHead>طريقة الدفع</TableHead>
              <TableHead>المرجع</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 3 }).map((_, i) => (
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
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center rounded-lg border border-border">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Wallet className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">لا توجد دفعات</h3>
        <p className="text-sm text-muted-foreground">
          لم يتم تسجيل أي دفعات على هذه الفاتورة بعد
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>التاريخ</TableHead>
              <TableHead>المبلغ</TableHead>
              <TableHead>طريقة الدفع</TableHead>
              <TableHead>المرجع</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="text-muted-foreground text-xs">
                  {formatDate(payment.paymentDate)}
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(payment.amount)}
                </TableCell>
                <TableCell>
                  {paymentMethodLabel[payment.paymentMethod]}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs font-mono">
                  {payment.reference || "—"}
                </TableCell>
                <TableCell className="text-left">
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => {
                        setErrorMessage(null);
                        setDeleteId(payment.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {payments.some((p) => p.notes) && (
        <div className="space-y-1 pt-2">
          {payments
            .filter((p) => p.notes)
            .map((payment) => (
              <p key={payment.id} className="text-xs text-muted-foreground">
                {payment.reference || "دفعة"}: {payment.notes}
              </p>
            ))}
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
        title="حذف الدفعة"
        description="هل أنت متأكد من حذف هذه الدفعة؟ سيتم إعادة احتساب حالة الفاتورة. لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف"
        variant="danger"
        isLoading={deleteMutation.isPending}
        errorMessage={errorMessage}
        onConfirm={handleDelete}
      />
    </>
  );
}
