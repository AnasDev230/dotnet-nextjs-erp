"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  CheckCircle,
  XCircle,
  Trash2,
  Pencil,
  PackageCheck,
} from "lucide-react";
import { Button } from "@/components/ui";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { PurchaseOrderStatus } from "../types/purchase-order.types";
import { useSubmitPurchaseOrder } from "../hooks/useSubmitPurchaseOrder";
import { useApprovePurchaseOrder } from "../hooks/useApprovePurchaseOrder";
import { useCancelPurchaseOrder } from "../hooks/useCancelPurchaseOrder";
import { useDeletePurchaseOrder } from "../hooks/useDeletePurchaseOrder";
import { useTranslation } from "@/hooks/use-translation";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/types/auth";

type ConfirmAction = "submit" | "approve" | "cancel" | "delete" | null;

interface PurchaseOrderStatusActionsProps {
  orderId: string;
  status: PurchaseOrderStatus;
}

export function PurchaseOrderStatusActions({
  orderId,
  status,
}: PurchaseOrderStatusActionsProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [confirmDialog, setConfirmDialog] = useState<ConfirmAction>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submitMutation = useSubmitPurchaseOrder();
  const approveMutation = useApprovePurchaseOrder();
  const cancelMutation = useCancelPurchaseOrder();
  const deleteMutation = useDeletePurchaseOrder();

  const isLoading =
    submitMutation.isPending ||
    approveMutation.isPending ||
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

  const handleSubmit = () => {
    setErrorMessage(null);
    submitMutation.mutate(orderId, {
      onSuccess: () => setConfirmDialog(null),
      onError: (error) => setErrorMessage(getErrorMessage(error)),
    });
  };

  const handleApprove = () => {
    setErrorMessage(null);
    approveMutation.mutate(orderId, {
      onSuccess: () => setConfirmDialog(null),
      onError: (error) => setErrorMessage(getErrorMessage(error)),
    });
  };

  const handleCancel = () => {
    setErrorMessage(null);
    cancelMutation.mutate(orderId, {
      onSuccess: () => setConfirmDialog(null),
      onError: (error) => setErrorMessage(getErrorMessage(error)),
    });
  };

  const handleDelete = () => {
    setErrorMessage(null);
    deleteMutation.mutate(orderId, {
      onSuccess: () => {
        setConfirmDialog(null);
        router.push("/purchasing/orders");
      },
      onError: (error) => setErrorMessage(getErrorMessage(error)),
    });
  };

  const confirmTitle: Record<Exclude<ConfirmAction, null>, string> = {
    submit: t("purchasing.orders.submit"),
    approve: t("purchasing.orders.approveTitle"),
    cancel: t("purchasing.orders.cancelTitle"),
    delete: t("purchasing.orders.deleteTitle"),
  };

  const confirmDescription: Record<Exclude<ConfirmAction, null>, string> = {
    submit: t("purchasing.orders.submitDescription"),
    approve: t("purchasing.orders.approveDescription"),
    cancel: t("purchasing.orders.cancelDescription"),
    delete: t("purchasing.orders.deleteDescription"),
  };

  const confirmVariant: Record<
    Exclude<ConfirmAction, null>,
    "warning" | "danger" | "info"
  > = {
    submit: "warning",
    approve: "info",
    cancel: "danger",
    delete: "danger",
  };

  const handleConfirm = () => {
    if (confirmDialog === "submit") handleSubmit();
    else if (confirmDialog === "approve") handleApprove();
    else if (confirmDialog === "cancel") handleCancel();
    else if (confirmDialog === "delete") handleDelete();
  };

  if (status === "Received" || status === "Cancelled") {
    return null;
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {status === "Draft" && (
          <>
            <Button
              onClick={() => setConfirmDialog("submit")}
              disabled={isLoading}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {t("purchasing.orders.submit")}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/purchasing/orders/${orderId}/edit`)}
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

        {status === "Submitted" && (
          <>
            <Button
              onClick={() => setConfirmDialog("approve")}
              disabled={isLoading}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              {t("purchasing.orders.approve")}
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
          </>
        )}

        {status === "Approved" && (
          <>
            <Button
              onClick={() =>
                router.push(`/purchasing/receipts/new?orderId=${orderId}`)
              }
              disabled={isLoading}
              className="gap-2"
            >
              <PackageCheck className="h-4 w-4" />
              {t("purchasing.orders.createReceipt")}
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
          </>
        )}

        {status === "PartiallyReceived" && (
          <Button
            onClick={() =>
              router.push(`/purchasing/receipts/new?orderId=${orderId}`)
            }
            disabled={isLoading}
            className="gap-2"
          >
            <PackageCheck className="h-4 w-4" />
            {t("purchasing.orders.receiveRemaining")}
          </Button>
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
        description={
          confirmDialog ? confirmDescription[confirmDialog] : ""
        }
        confirmLabel={t("common.confirm")}
        variant={confirmDialog ? confirmVariant[confirmDialog] : "warning"}
        isLoading={isLoading}
        errorMessage={errorMessage}
        onConfirm={handleConfirm}
      />
    </>
  );
}
