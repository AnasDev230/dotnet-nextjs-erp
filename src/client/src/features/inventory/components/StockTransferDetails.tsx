"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Send,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  PackageCheck,
  Check,
  Loader2,
  ShieldX,
  Printer,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Alert,
} from "@/components/ui";
import { StockTransferPrint } from "@/components/print/stock-transfer-print";
import { usePrint } from "@/hooks/use-print";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type {
  StockTransferStatus,
  StockTransferDetail,
} from "../types/stock-transfer.types";
import { useStockTransfer } from "../hooks/useStockTransfer";
import { useSubmitStockTransfer } from "../hooks/useSubmitStockTransfer";
import { useApproveStockTransfer } from "../hooks/useApproveStockTransfer";
import { useCompleteStockTransfer } from "../hooks/useCompleteStockTransfer";
import { useCancelStockTransfer } from "../hooks/useCancelStockTransfer";
import { useDeleteStockTransfer } from "../hooks/useDeleteStockTransfer";
import { formatDate } from "@/lib/formatters";
import { useTranslation } from "@/hooks/use-translation";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";

type ConfirmAction = "submit" | "approve" | "complete" | "cancel" | "delete" | null;

const STATUS_CONFIG: Record<
  StockTransferStatus,
  { labelKey: string; badgeClass: string }
> = {
  Draft: {
    labelKey: "stockTransfer.status.draft",
    badgeClass: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  },
  Submitted: {
    labelKey: "stockTransfer.status.submitted",
    badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  Approved: {
    labelKey: "stockTransfer.status.approved",
    badgeClass: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  Completed: {
    labelKey: "stockTransfer.status.completed",
    badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  Cancelled: {
    labelKey: "stockTransfer.status.cancelled",
    badgeClass: "bg-red-500/10 text-red-600 border-red-500/20",
  },
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

function StatusTimeline({ status }: { status: StockTransferStatus }) {
  const { t } = useTranslation();
  const flow: StockTransferStatus[] = [
    "Draft",
    "Submitted",
    "Approved",
    "Completed",
  ];

  if (status === "Cancelled") {
    return (
      <div className="flex items-center gap-2 rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-600">
        <ShieldX className="h-4 w-4" />
        <span className="font-medium">{t("stockTransfer.status.cancelled")}</span>
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
                {t(STATUS_CONFIG[step].labelKey)}
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

interface StockTransferDetailsProps {
  transferId: string;
}

export default function StockTransferDetails({
  transferId,
}: StockTransferDetailsProps) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { handlePrint } = usePrint();
  const [showPrint, setShowPrint] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmAction>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    data: transfer,
    isLoading,
    error,
  } = useStockTransfer(transferId);

  const submitMutation = useSubmitStockTransfer(transferId);
  const approveMutation = useApproveStockTransfer(transferId);
  const completeMutation = useCompleteStockTransfer(transferId);
  const cancelMutation = useCancelStockTransfer(transferId);
  const deleteMutation = useDeleteStockTransfer();

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
    if (!confirmDialog || !transfer) return;
    setErrorMessage(null);

    const onError = (err: unknown) => setErrorMessage(getServerError(err));

    if (confirmDialog === "submit") {
      submitMutation.mutate(undefined, {
        onSuccess: () => setConfirmDialog(null),
        onError,
      });
    } else if (confirmDialog === "approve") {
      approveMutation.mutate(undefined, {
        onSuccess: () => setConfirmDialog(null),
        onError,
      });
    } else if (confirmDialog === "complete") {
      completeMutation.mutate(undefined, {
        onSuccess: () => setConfirmDialog(null),
        onError,
      });
    } else if (confirmDialog === "cancel") {
      cancelMutation.mutate(undefined, {
        onSuccess: () => setConfirmDialog(null),
        onError,
      });
    } else if (confirmDialog === "delete") {
      deleteMutation.mutate(transfer.id, {
        onSuccess: () => {
          setConfirmDialog(null);
          router.push("/inventory/stock-transfers");
        },
        onError,
      });
    }
  };

  const confirmTitle: Record<Exclude<ConfirmAction, null>, string> = {
    submit: t("stockTransfer.confirm.submit.title"),
    approve: t("stockTransfer.confirm.approve.title"),
    complete: t("stockTransfer.confirm.complete.title"),
    cancel: t("stockTransfer.confirm.cancel.title"),
    delete: t("stockTransfer.confirm.delete.title"),
  };

  const confirmDescription: Record<Exclude<ConfirmAction, null>, string> = {
    submit: t("stockTransfer.confirm.submit.description"),
    approve: t("stockTransfer.confirm.approve.description"),
    complete: t("stockTransfer.confirm.complete.description"),
    cancel: t("stockTransfer.confirm.cancel.description"),
    delete: t("stockTransfer.confirm.delete.description"),
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

  if (error || !transfer) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              {t("stockTransfer.notFound")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("stockTransfer.notFoundDescription")}
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
              <span className="font-mono">{transfer.transferNumber}</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("stockTransfer.details")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowPrint(true)}
          >
            <Printer className="h-4 w-4" />
            {t("common.print")}
          </Button>
          {transfer.status === "Draft" && (
            <>
              <Button
                onClick={() => setConfirmDialog("submit")}
                disabled={isActionPending}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {t("stockTransfer.submit")}
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/inventory/stock-transfers/${transferId}/edit`)
                }
                disabled={isActionPending}
                className="gap-2"
              >
                <Pencil className="h-4 w-4" />
                {t("common.edit")}
              </Button>
              <Button
                variant="destructive"
                onClick={() => setConfirmDialog("delete")}
                disabled={isActionPending}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {t("common.delete")}
              </Button>
            </>
          )}

          {transfer.status === "Submitted" && (
            <>
              <Button
                onClick={() => setConfirmDialog("approve")}
                disabled={isActionPending}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                {t("stockTransfer.approve")}
              </Button>
              <Button
                variant="outline"
                onClick={() => setConfirmDialog("cancel")}
                disabled={isActionPending}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                {t("common.cancel")}
              </Button>
            </>
          )}

          {transfer.status === "Approved" && (
            <>
              <Button
                onClick={() => setConfirmDialog("complete")}
                disabled={isActionPending}
                className="gap-2"
              >
                <PackageCheck className="h-4 w-4" />
                {t("stockTransfer.complete")}
              </Button>
              <Button
                variant="outline"
                onClick={() => setConfirmDialog("cancel")}
                disabled={isActionPending}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                {t("common.cancel")}
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("stockTransfer.info")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <StatusTimeline status={transfer.status} />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoRow
              label={t("stockTransfer.transferNumber")}
              value={<span className="font-mono">{transfer.transferNumber}</span>}
            />
            <InfoRow label={t("stockTransfer.fromWarehouse")} value={transfer.fromWarehouseName} />
            <InfoRow label={t("stockTransfer.toWarehouse")} value={transfer.toWarehouseName} />
            <InfoRow
              label={t("stockTransfer.product")}
              value={
                <div className="flex flex-col">
                  <span>{transfer.productName}</span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {transfer.productSku}
                  </span>
                </div>
              }
            />
            <InfoRow
              label={t("stockTransfer.quantity")}
              value={<span className="tabular-nums">{transfer.quantity}</span>}
            />
            <InfoRow
              label={t("common.status")}
              value={
                <span
                  className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${STATUS_CONFIG[transfer.status].badgeClass}`}
                >
                  {t(STATUS_CONFIG[transfer.status].labelKey)}
                </span>
              }
            />
            <InfoRow label={t("stockTransfer.createdBy")} value={transfer.createdByName ?? "—"} />
            <InfoRow
              label={t("common.createdAt")}
              value={formatDate(transfer.createdAt, language)}
            />
            {transfer.notes && (
              <InfoRow label={t("stockTransfer.notes")} value={transfer.notes} />
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("stockTransfer.approvalInfo")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoRow
              label={t("stockTransfer.approvedBy")}
              value={transfer.approvedByName ?? "—"}
            />
            <InfoRow
              label={t("stockTransfer.approvedAt")}
              value={transfer.approvedAt ? formatDate(transfer.approvedAt, language) : "—"}
            />
            <InfoRow
              label={t("stockTransfer.completedAt")}
              value={transfer.completedAt ? formatDate(transfer.completedAt, language) : "—"}
            />
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
          <StockTransferPrint transfer={transfer} />
        </div>
      )}
    </div>
  );
}