"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Trash2, Pencil, Banknote } from "lucide-react";
import { Button } from "@/components/ui";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { SupplierInvoiceStatus } from "../types/supplier-invoice.types";
import { useReceiveSupplierInvoice } from "../hooks/useReceiveSupplierInvoice";
import { useCancelSupplierInvoice } from "../hooks/useCancelSupplierInvoice";
import { useDeleteSupplierInvoice } from "../hooks/useDeleteSupplierInvoice";
import { useTranslation } from "@/hooks/use-translation";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";

type ConfirmAction = "receive" | "cancel" | "delete" | null;

interface SupplierInvoiceStatusActionsProps {
  invoiceId: string;
  status: SupplierInvoiceStatus;
  onNewPayment: () => void;
}

export function SupplierInvoiceStatusActions({
  invoiceId,
  status,
  onNewPayment,
}: SupplierInvoiceStatusActionsProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [confirmDialog, setConfirmDialog] = useState<ConfirmAction>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const receiveMutation = useReceiveSupplierInvoice();
  const cancelMutation = useCancelSupplierInvoice();
  const deleteMutation = useDeleteSupplierInvoice();

  const isLoading =
    receiveMutation.isPending ||
    cancelMutation.isPending ||
    deleteMutation.isPending;

  const getErrorMessage = (error: unknown): string => {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    return (
      axiosError.response?.data?.message ||
      (error instanceof Error ? error.message : "") ||
      t("common.unexpectedError")
    );
  };

  const handleReceive = () => {
    setErrorMessage(null);
    receiveMutation.mutate(invoiceId, {
      onSuccess: () => setConfirmDialog(null),
      onError: (error) => setErrorMessage(getErrorMessage(error)),
    });
  };

  const handleCancel = () => {
    setErrorMessage(null);
    cancelMutation.mutate(invoiceId, {
      onSuccess: () => setConfirmDialog(null),
      onError: (error) => setErrorMessage(getErrorMessage(error)),
    });
  };

  const handleDelete = () => {
    setErrorMessage(null);
    deleteMutation.mutate(invoiceId, {
      onSuccess: () => {
        setConfirmDialog(null);
        router.push("/purchasing/supplier-invoices");
      },
      onError: (error) => setErrorMessage(getErrorMessage(error)),
    });
  };

  const confirmTitle: Record<Exclude<ConfirmAction, null>, string> = {
    receive: t("supplierInvoice.confirm.receive.title"),
    cancel: t("supplierInvoice.confirm.cancel.title"),
    delete: t("supplierInvoice.confirm.delete.title"),
  };

  const confirmDescription: Record<Exclude<ConfirmAction, null>, string> = {
    receive: t("supplierInvoice.confirm.receive.description"),
    cancel: t("supplierInvoice.confirm.cancel.description"),
    delete: t("supplierInvoice.confirm.delete.description"),
  };

  const confirmVariant: Record<
    Exclude<ConfirmAction, null>,
    "warning" | "danger" | "info"
  > = {
    receive: "info",
    cancel: "danger",
    delete: "danger",
  };

  const handleConfirm = () => {
    if (confirmDialog === "receive") handleReceive();
    else if (confirmDialog === "cancel") handleCancel();
    else if (confirmDialog === "delete") handleDelete();
  };

  if (status === "Paid" || status === "Cancelled") {
    return null;
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {status === "Draft" && (
          <>
            <Button
              onClick={() => setConfirmDialog("receive")}
              disabled={isLoading}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              {t("supplierInvoice.receive")}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/purchasing/supplier-invoices/${invoiceId}/edit`)
              }
              disabled={isLoading}
              className="gap-2"
            >
              <Pencil className="h-4 w-4" />
              {t("common.edit")}
            </Button>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog("cancel")}
              disabled={isLoading}
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setConfirmDialog("delete")}
              disabled={isLoading}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {t("common.delete")}
            </Button>
          </>
        )}

        {(status === "Received" || status === "PartiallyPaid") && (
          <>
            <Button onClick={onNewPayment} disabled={isLoading} className="gap-2">
              <Banknote className="h-4 w-4" />
              {t("purchasePayment.new")}
            </Button>
            {status === "Received" && (
              <Button
                variant="outline"
                onClick={() => setConfirmDialog("cancel")}
                disabled={isLoading}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                {t("common.cancel")}
              </Button>
            )}
          </>
        )}
      </div>

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
        confirmLabel={t("common.confirm")}
        variant={confirmDialog ? confirmVariant[confirmDialog] : "warning"}
        isLoading={isLoading}
        errorMessage={errorMessage}
        onConfirm={handleConfirm}
      />
    </>
  );
}