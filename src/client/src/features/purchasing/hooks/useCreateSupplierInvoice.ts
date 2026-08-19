import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/error-handler";
import { createSupplierInvoice } from "../api/supplier-invoices";
import type { CreateSupplierInvoiceRequest } from "../types/supplier-invoice.types";

export function useCreateSupplierInvoice() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateSupplierInvoiceRequest) =>
      createSupplierInvoice(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["supplier-invoices"] });
      success(t("supplierInvoice.toast.created"), data.invoiceNumber);
    },
    onError: (err) => {
      error(
        t("toast.error.generic"),
        getErrorMessage(err) || t("common.unexpectedError")
      );
    },
  });
}