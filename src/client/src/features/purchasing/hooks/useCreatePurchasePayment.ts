import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/error-handler";
import { createPurchasePayment } from "../api/purchase-payments";
import type { CreatePurchasePaymentRequest } from "../types/purchase-payment.types";

export function useCreatePurchasePayment() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreatePurchasePaymentRequest) =>
      createPurchasePayment(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-payments"] });
      queryClient.invalidateQueries({
        queryKey: ["supplier-invoice", variables.supplierInvoiceId],
      });
      queryClient.invalidateQueries({ queryKey: ["supplier-invoices"] });
      success(t("purchasePayment.toast.created"));
    },
    onError: (err) => {
      error(
        t("toast.error.generic"),
        getErrorMessage(err) || t("common.unexpectedError")
      );
    },
  });
}