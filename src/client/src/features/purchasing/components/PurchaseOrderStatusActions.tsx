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
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Alert,
} from "@/components/ui";
import type { PurchaseOrderStatus } from "../types/purchase-order.types";
import { useSubmitPurchaseOrder } from "../hooks/useSubmitPurchaseOrder";
import { useApprovePurchaseOrder } from "../hooks/useApprovePurchaseOrder";
import { useCancelPurchaseOrder } from "../hooks/useCancelPurchaseOrder";
import { useDeletePurchaseOrder } from "../hooks/useDeletePurchaseOrder";
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
      "حدث خطأ غير متوقع"
    );
  };

  const handleSubmit = () => {
    setErrorMessage(null);
    submitMutation.mutate(orderId, {
      onSuccess: () => setConfirmDialog(null),
      onError: (error) => {
        setErrorMessage(getErrorMessage(error));
        setConfirmDialog(null);
      },
    });
  };

  const handleApprove = () => {
    setErrorMessage(null);
    approveMutation.mutate(orderId, {
      onSuccess: () => setConfirmDialog(null),
      onError: (error) => {
        setErrorMessage(getErrorMessage(error));
        setConfirmDialog(null);
      },
    });
  };

  const handleCancel = () => {
    setErrorMessage(null);
    cancelMutation.mutate(orderId, {
      onSuccess: () => setConfirmDialog(null),
      onError: (error) => {
        setErrorMessage(getErrorMessage(error));
        setConfirmDialog(null);
      },
    });
  };

  const handleDelete = () => {
    setErrorMessage(null);
    deleteMutation.mutate(orderId, {
      onSuccess: () => {
        setConfirmDialog(null);
        router.push("/purchasing/orders");
      },
      onError: (error) => {
        setErrorMessage(getErrorMessage(error));
        setConfirmDialog(null);
      },
    });
  };

  const confirmTitle: Record<Exclude<ConfirmAction, null>, string> = {
    submit: "إرسال للاعتماد",
    approve: "اعتماد أمر الشراء",
    cancel: "إلغاء أمر الشراء",
    delete: "حذف أمر الشراء",
  };

  const confirmDescription: Record<Exclude<ConfirmAction, null>, string> = {
    submit:
      "هل أنت متأكد من إرسال هذا الأمر للاعتماد؟ لن تتمكن من تعديله بعد الإرسال.",
    approve:
      "هل أنت متأكد من اعتماد هذا الأمر؟ سيصبح جاهزاً لاستلام البضاعة.",
    cancel: "هل أنت متأكد من إلغاء هذا الأمر؟ لا يمكن التراجع عن هذا الإجراء.",
    delete: "هل أنت متأكد من حذف هذا الأمر؟ لا يمكن التراجع عن هذا الإجراء.",
  };

  if (status === "Received" || status === "Cancelled") {
    return null;
  }

  return (
    <>
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4 ml-2" />
          <p>{errorMessage}</p>
        </Alert>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {status === "Draft" && (
          <>
            <Button
              onClick={() => setConfirmDialog("submit")}
              disabled={isLoading}
            >
              <Send className="ml-2 h-4 w-4" />
              إرسال للاعتماد
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/purchasing/orders/${orderId}/edit`)}
              disabled={isLoading}
            >
              <Pencil className="ml-2 h-4 w-4" />
              تعديل
            </Button>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog("cancel")}
              disabled={isLoading}
            >
              <XCircle className="ml-2 h-4 w-4" />
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={() => setConfirmDialog("delete")}
              disabled={isLoading}
            >
              <Trash2 className="ml-2 h-4 w-4" />
              حذف
            </Button>
          </>
        )}

        {status === "Submitted" && (
          <>
            <Button
              onClick={() => setConfirmDialog("approve")}
              disabled={isLoading}
            >
              <CheckCircle className="ml-2 h-4 w-4" />
              اعتماد
            </Button>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog("cancel")}
              disabled={isLoading}
            >
              <XCircle className="ml-2 h-4 w-4" />
              إلغاء
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
            >
              <PackageCheck className="ml-2 h-4 w-4" />
              إنشاء استلام
            </Button>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog("cancel")}
              disabled={isLoading}
            >
              <XCircle className="ml-2 h-4 w-4" />
              إلغاء
            </Button>
          </>
        )}

        {status === "PartiallyReceived" && (
          <Button
            onClick={() =>
              router.push(`/purchasing/receipts/new?orderId=${orderId}`)
            }
            disabled={isLoading}
          >
            <PackageCheck className="ml-2 h-4 w-4" />
            استلام الباقي
          </Button>
        )}
      </div>

      <Dialog
        open={confirmDialog !== null}
        onOpenChange={() => setConfirmDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog ? confirmTitle[confirmDialog] : ""}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog ? confirmDescription[confirmDialog] : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog(null)}
              disabled={isLoading}
            >
              تراجع
            </Button>
            <Button
              variant={
                confirmDialog === "delete" || confirmDialog === "cancel"
                  ? "destructive"
                  : "default"
              }
              onClick={() => {
                if (confirmDialog === "submit") handleSubmit();
                else if (confirmDialog === "approve") handleApprove();
                else if (confirmDialog === "cancel") handleCancel();
                else if (confirmDialog === "delete") handleDelete();
              }}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              تأكيد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
