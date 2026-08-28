"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, XCircle, AlertCircle, Printer } from "lucide-react";
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
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { GoodsReceiptStatusBadge } from "./GoodsReceiptStatusBadge";
import { useGoodsReceipt } from "../hooks/useGoodsReceipt";
import { useCancelGoodsReceipt } from "../hooks/useCancelGoodsReceipt";
import { formatDate } from "@/lib/formatters";
import { useTranslation } from "@/hooks/use-translation";
import { GoodsReceiptPrint } from "@/components/print/goods-receipt-print";
import { usePrint } from "@/hooks/use-print";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";

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
  const { t, language } = useTranslation();
  const { handlePrint } = usePrint();
  const [showPrint, setShowPrint] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data: receipt, isLoading, error } = useGoodsReceipt(receiptId);
  const cancelMutation = useCancelGoodsReceipt();

  const handleCancel = () => {
    cancelMutation.mutate(receiptId, {
      onSuccess: () => {
        setCancelOpen(false);
        setErrorMessage(null);
      },
      onError: (error: any) => {
        setErrorMessage(
          error?.response?.data?.message ||
            error?.message ||
            t("common.unexpectedError")
        );
      },
    });
  };

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
            <h1 className="text-2xl font-semibold">{t("purchasing.receipts.notFound")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("purchasing.receipts.notFoundDescription")}
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
              {t("purchasing.receipts.details")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowPrint(true)}
          >
            <Printer className="h-4 w-4" />
            {t("common.print")}
          </Button>
          {receipt.status === "Received" && (
            <Button
              variant="outline"
              className="gap-2 text-destructive"
              disabled={cancelMutation.isPending}
              onClick={() => {
                setErrorMessage(null);
                setCancelOpen(true);
              }}
            >
              <XCircle className="h-4 w-4" />
              {t("purchasing.receipts.cancelReceipt")}
            </Button>
          )}
          <Link href={`/purchasing/orders/${receipt.purchaseOrderId}`}>
            <Button variant="outline">{t("purchasing.receipts.purchaseOrder")}</Button>
          </Link>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("purchasing.receipts.receiptInfo")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoRow
              label={t("purchasing.receipts.grnNumber")}
              value={<span className="font-mono">{receipt.grnNumber}</span>}
            />
            <InfoRow
              label={t("purchasing.receipts.purchaseOrder")}
              value={
                <Link
                  href={`/purchasing/orders/${receipt.purchaseOrderId}`}
                  className="text-primary underline underline-offset-4"
                >
                  <span className="font-mono">{receipt.poNumber}</span>
                </Link>
              }
            />
            <InfoRow label={t("purchasing.orders.supplier")} value={receipt.supplierName} />
            <InfoRow label={t("purchasing.receipts.receiptDate")} value={formatDate(receipt.receiptDate, language)} />
            <InfoRow label={t("purchasing.receipts.warehouse")} value={receipt.warehouseName} />
            <InfoRow
              label={t("common.status")}
              value={<GoodsReceiptStatusBadge status={receipt.status} />}
            />
            {receipt.notes && <InfoRow label={t("common.notes")} value={receipt.notes} />}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("purchasing.receipts.receivedProducts")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t("purchasing.orders.product")}</TableHead>
                <TableHead className="text-end">{t("common.quantity")}</TableHead>
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
                  <TableCell className="text-end font-medium tabular-nums">
                    {item.quantity}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCancelOpen(false);
            setErrorMessage(null);
          }
        }}
        title={t("purchasing.receipts.cancelReceipt")}
        description={t("purchasing.receipts.cancelDescription")}
        confirmLabel={t("purchasing.receipts.confirmCancel")}
        variant="danger"
        isLoading={cancelMutation.isPending}
        errorMessage={errorMessage}
        onConfirm={handleCancel}
      />

      {showPrint && (
        <div className="fixed inset-0 z-50 bg-white overflow-auto">
          <div className="no-print flex items-center justify-between p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-lg">{t("print.preview")}</h3>
            <div className="flex gap-2">
              <Button onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" />
                {t("print.print")}
              </Button>
              <Button variant="outline" onClick={() => setShowPrint(false)}>
                {t("print.close")}
              </Button>
            </div>
          </div>
          <GoodsReceiptPrint receipt={receipt} />
        </div>
      )}
    </div>
  );
}
