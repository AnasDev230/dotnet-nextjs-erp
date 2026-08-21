"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Send,
  Trash2,
  CheckCircle,
  XCircle,
  PackageCheck,
  Check,
  Loader2,
  ShieldX,
} from "lucide-react";
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
import { RETURN_STATUS_CONFIG } from "@/types/returns";
import type { ReturnStatus } from "@/types/returns";
import {
  useApprovePurchaseReturn,
  useCancelPurchaseReturn,
  useCompletePurchaseReturn,
  useDeletePurchaseReturn,
  usePurchaseReturn,
  useSubmitPurchaseReturn,
} from "../hooks/usePurchaseReturns";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { useTranslation } from "@/hooks/use-translation";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";

type ConfirmAction = "submit" | "approve" | "complete" | "cancel" | "delete" | null;

function StatusTimeline({ status }: { status: ReturnStatus }) {
  const { t } = useTranslation();
  const flow: ReturnStatus[] = ["Draft", "Submitted", "Approved", "Completed"];

  if (status === "Cancelled") {
    return (
      <div className="flex items-center gap-2 rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-600">
        <ShieldX className="h-4 w-4" />
        <span className="font-medium">{t("returns.status.cancelled")}</span>
      </div>
    );
  }

  const currentIndex = flow.indexOf(status);

  return (
    <div className="flex items-center">
      {flow.map((step, index) => {
        const reached = index <= currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <div key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={
                  reached
                    ? `flex h-8 w-8 items-center justify-center rounded-full ${
                        isCurrent
                          ? "bg-blue-500 text-white ring-4 ring-blue-500/20"
                          : "bg-emerald-500 text-white"
                      }`
                    : "flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground"
                }
              >
                {reached ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </div>
              <span
                className={
                  reached
                    ? isCurrent
                      ? "text-xs font-semibold text-blue-600"
                      : "text-xs font-medium text-emerald-600"
                    : "text-xs text-muted-foreground"
                }
              >
                {t(RETURN_STATUS_CONFIG[step].labelKey)}
              </span>
            </div>
            {index < flow.length - 1 && (
              <div
                className={`mx-2 mb-6 h-0.5 flex-1 rounded ${
                  index < currentIndex ? "bg-emerald-500" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

interface PurchaseReturnDetailsProps {
  purchaseReturnId: string;
}

function StatusActions({
  status,
  onAction,
}: {
  status: ReturnStatus;
  onAction: (action: ConfirmAction) => void;
}) {
  const { t } = useTranslation();

  if (status === "Draft") {
    return (
      <>
        <Button onClick={() => onAction("submit")} className="gap-2">
          <Send className="h-4 w-4" />
          {t("returns.submit")}
        </Button>
        <Button
          variant="destructive"
          onClick={() => onAction("delete")}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          {t("common.delete")}
        </Button>
      </>
    );
  }

  if (status === "Submitted") {
    return (
      <>
        <Button onClick={() => onAction("approve")} className="gap-2">
          <CheckCircle className="h-4 w-4" />
          {t("returns.approve")}
        </Button>
        <Button
          variant="outline"
          onClick={() => onAction("cancel")}
          className="gap-2"
        >
          <XCircle className="h-4 w-4" />
          {t("returns.cancel")}
        </Button>
      </>
    );
  }

  if (status === "Approved") {
    return (
      <Button onClick={() => onAction("complete")} className="gap-2">
        <PackageCheck className="h-4 w-4" />
        {t("returns.complete")}
      </Button>
    );
  }

  return null;
}

export default function PurchaseReturnDetails({
  purchaseReturnId,
}: PurchaseReturnDetailsProps) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [confirmDialog, setConfirmDialog] = useState<ConfirmAction>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    data: purchaseReturn,
    isLoading,
    error,
  } = usePurchaseReturn(purchaseReturnId);

  const submitMutation = useSubmitPurchaseReturn();
  const approveMutation = useApprovePurchaseReturn();
  const completeMutation = useCompletePurchaseReturn();
  const cancelMutation = useCancelPurchaseReturn();
  const deleteMutation = useDeletePurchaseReturn();

  const isActionPending =
    submitMutation.isPending ||
    approveMutation.isPending ||
    completeMutation.isPending ||
    cancelMutation.isPending ||
    deleteMutation.isPending;

  const getServerError = (err: unknown): string => {
    const axiosError = err as AxiosError<ApiResponse<unknown>>;
    return (
      axiosError.response?.data?.message ||
      (err instanceof Error ? err.message : "") ||
      t("common.unexpectedError")
    );
  };

  const handleConfirm = () => {
    if (!confirmDialog || !purchaseReturn) return;
    setErrorMessage(null);

    const onError = (err: unknown) => setErrorMessage(getServerError(err));

    if (confirmDialog === "submit") {
      submitMutation.mutate(purchaseReturn.id, {
        onSuccess: () => setConfirmDialog(null),
        onError,
      });
    } else if (confirmDialog === "approve") {
      approveMutation.mutate(purchaseReturn.id, {
        onSuccess: () => setConfirmDialog(null),
        onError,
      });
    } else if (confirmDialog === "complete") {
      completeMutation.mutate(purchaseReturn.id, {
        onSuccess: () => setConfirmDialog(null),
        onError,
      });
    } else if (confirmDialog === "cancel") {
      cancelMutation.mutate(purchaseReturn.id, {
        onSuccess: () => setConfirmDialog(null),
        onError,
      });
    } else if (confirmDialog === "delete") {
      deleteMutation.mutate(purchaseReturn.id, {
        onSuccess: () => {
          setConfirmDialog(null);
          router.push("/purchasing/returns");
        },
        onError,
      });
    }
  };

  const confirmTitle: Record<Exclude<ConfirmAction, null>, string> = {
    submit: t("returns.confirm.submit.title"),
    approve: t("returns.confirm.approve.title"),
    complete: t("returns.confirm.complete.title"),
    cancel: t("returns.confirm.cancel.title"),
    delete: t("returns.confirm.delete.title"),
  };

  const confirmDescription: Record<Exclude<ConfirmAction, null>, string> = {
    submit: t("returns.confirm.submit.description"),
    approve: t("returns.confirm.approve.description"),
    complete: t("returns.confirm.complete.description.purchase"),
    cancel: t("returns.confirm.cancel.description"),
    delete: t("returns.confirm.delete.description"),
  };

  const confirmVariant: Record<
    Exclude<ConfirmAction, null>,
    "warning" | "danger" | "info"
  > = {
    submit: "info",
    approve: "info",
    complete: "warning",
    cancel: "danger",
    delete: "danger",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !purchaseReturn) {
    const axiosError = error as AxiosError<ApiResponse<unknown>> | null;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{t("returns.notFound")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("returns.notFoundDescription")}
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
              <span className="font-mono">{purchaseReturn.returnNumber}</span>
            </h1>
            <p className="text-muted-foreground text-sm">{t("returns.details")}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusActions
            status={purchaseReturn.status}
            onAction={setConfirmDialog}
          />
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("returns.info")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <StatusTimeline status={purchaseReturn.status} />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoRow
              label={t("returns.returnNumber")}
              value={
                <span className="font-mono">{purchaseReturn.returnNumber}</span>
              }
            />
            <InfoRow
              label={t("returns.goodsReceipt")}
              value={
                <Link
                  href={`/purchasing/receipts/${purchaseReturn.goodsReceiptId}`}
                  className="font-mono text-primary hover:underline"
                >
                  {purchaseReturn.grnNumber}
                </Link>
              }
            />
            <InfoRow label={t("returns.supplier")} value={purchaseReturn.supplierName} />
            <InfoRow label={t("returns.warehouse")} value={purchaseReturn.warehouseName} />
            <InfoRow
              label={t("returns.returnDate")}
              value={formatDate(purchaseReturn.returnDate, language)}
            />
            <InfoRow
              label={t("returns.totalAmount")}
              value={
                <span className="font-medium tabular-nums">
                  {formatCurrency(purchaseReturn.totalAmount, language)}
                </span>
              }
            />
            <InfoRow
              label={t("common.status")}
              value={
                <span
                  className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${RETURN_STATUS_CONFIG[purchaseReturn.status].badgeClass}`}
                >
                  {t(RETURN_STATUS_CONFIG[purchaseReturn.status].labelKey)}
                </span>
              }
            />
            <InfoRow
              label={t("common.createdAt")}
              value={formatDate(purchaseReturn.createdAt, language)}
            />
          </div>
          {purchaseReturn.reason && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                {t("returns.reason")}
              </Label>
              <p className="text-sm">{purchaseReturn.reason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("returns.approvalInfo")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoRow
              label={t("returns.approvedAt")}
              value={
                purchaseReturn.approvedAt
                  ? formatDate(purchaseReturn.approvedAt, language)
                  : "—"
              }
            />
            <InfoRow
              label={t("returns.completedAt")}
              value={
                purchaseReturn.completedAt
                  ? formatDate(purchaseReturn.completedAt, language)
                  : "—"
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("returns.items")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("returns.product")}
                </TableHead>
                <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("returns.quantity")}
                </TableHead>
                <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("returns.unitCost")}
                </TableHead>
                <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider text-end">
                  {t("returns.lineTotal")}
                </TableHead>
                <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("returns.itemReason")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseReturn.items.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="px-4 py-3 text-sm">
                    <div className="font-medium">{item.productName}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {item.productSku}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm tabular-nums">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm tabular-nums">
                    {formatCurrency(item.unitCost, language)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-end text-sm font-medium tabular-nums">
                    {formatCurrency(item.lineTotal, language)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                    {item.reason ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex justify-end">
            <div className="flex items-center justify-between gap-6 rounded-md border border-border bg-muted/30 px-4 py-2">
              <span className="text-sm text-muted-foreground">
                {t("returns.totalAmount")}
              </span>
              <span className="text-base font-semibold tabular-nums">
                {formatCurrency(purchaseReturn.totalAmount, language)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDialog !== null}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmDialog(null);
            setErrorMessage(null);
          }
        }}
        title={confirmDialog ? confirmTitle[confirmDialog] : ""}
        description={confirmDialog ? confirmDescription[confirmDialog] : ""}
        confirmLabel={
          confirmDialog
            ? confirmDialog === "delete"
              ? t("common.delete")
              : t("common.confirm")
            : undefined
        }
        variant={confirmDialog ? confirmVariant[confirmDialog] : "warning"}
        isLoading={isActionPending}
        errorMessage={errorMessage}
        onConfirm={handleConfirm}
      />
    </div>
  );
}