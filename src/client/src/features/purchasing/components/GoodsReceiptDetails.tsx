"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, XCircle, AlertCircle } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Alert,
} from "@/components/ui";
import { GoodsReceiptStatusBadge } from "./GoodsReceiptStatusBadge";
import { useGoodsReceipt } from "../hooks/useGoodsReceipt";
import { useCancelGoodsReceipt } from "../hooks/useCancelGoodsReceipt";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";

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

export default function GoodsReceiptDetails({
  receiptId,
}: {
  receiptId: string;
}) {
  const router = useRouter();
  const [cancelOpen, setCancelOpen] = useState(false);
  const { data: receipt, isLoading, error } = useGoodsReceipt(receiptId);
  const cancelMutation = useCancelGoodsReceipt();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !receipt) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">الاستلام غير موجود</h1>
            <p className="text-muted-foreground text-sm">
              لم يتم العثور على عملية الاستلام المطلوبة
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
              <span className="font-mono">{receipt.grnNumber}</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              تفاصيل استلام البضاعة
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {receipt.status === "Received" && (
            <Button
              variant="outline"
              className="text-destructive"
              onClick={() => setCancelOpen(true)}
            >
              <XCircle className="ml-2 h-4 w-4" />
              إلغاء الاستلام
            </Button>
          )}
          <Link href={`/purchasing/orders/${receipt.purchaseOrderId}`}>
            <Button variant="outline">أمر الشراء</Button>
          </Link>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">بيانات الاستلام</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoRow
              label="رقم الاستلام"
              value={<span className="font-mono">{receipt.grnNumber}</span>}
            />
            <InfoRow
              label="أمر الشراء"
              value={
                <Link
                  href={`/purchasing/orders/${receipt.purchaseOrderId}`}
                  className="text-primary underline underline-offset-4"
                >
                  <span className="font-mono">{receipt.poNumber}</span>
                </Link>
              }
            />
            <InfoRow label="المورد" value={receipt.supplierName} />
            <InfoRow label="تاريخ الاستلام" value={formatDate(receipt.receiptDate)} />
            <InfoRow label="المستودع" value={receipt.warehouseName} />
            <InfoRow
              label="الحالة"
              value={<GoodsReceiptStatusBadge status={receipt.status} />}
            />
            {receipt.notes && <InfoRow label="ملاحظات" value={receipt.notes} />}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">المنتجات المستلمة</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المنتج</TableHead>
                <TableHead className="text-left">الكمية</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipt.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.productName}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {item.productSku}
                    </div>
                  </TableCell>
                  <TableCell className="text-left font-medium">
                    {item.quantity}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إلغاء الاستلام</DialogTitle>
            <DialogDescription>
              سيتم عكس الكميات من المخزون وتراجعها عن أمر الشراء. لا يمكن
              التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              تراجع
            </Button>
            <Button
              variant="destructive"
              disabled={cancelMutation.isPending}
              onClick={() => {
                cancelMutation.mutate(receipt.id, {
                  onSuccess: () => setCancelOpen(false),
                });
              }}
            >
              {cancelMutation.isPending && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              )}
              تأكيد الإلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
