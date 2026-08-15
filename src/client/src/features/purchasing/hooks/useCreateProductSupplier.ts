import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/error-handler";
import { createProductSupplier } from "../api/product-suppliers";
import type { CreateProductSupplierRequest } from "../types/product-supplier.types";

export function useCreateProductSupplier() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateProductSupplierRequest) =>
      createProductSupplier(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product-suppliers"] });
      queryClient.invalidateQueries({
        queryKey: ["product-suppliers-by-product", variables.productId],
      });
      queryClient.invalidateQueries({
        queryKey: ["product-suppliers-by-supplier", variables.supplierId],
      });
      success(t("toast.created"));
    },
    onError: (err) => {
      error(
        t("toast.error.generic"),
        getErrorMessage(err) || t("common.unexpectedError")
      );
    },
  });
}
