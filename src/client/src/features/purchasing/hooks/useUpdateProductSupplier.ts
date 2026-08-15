import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/error-handler";
import { updateProductSupplier } from "../api/product-suppliers";
import type { UpdateProductSupplierRequest } from "../types/product-supplier.types";

export function useUpdateProductSupplier() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProductSupplierRequest;
    }) => updateProductSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-suppliers"] });
      queryClient.invalidateQueries({
        queryKey: ["product-suppliers-by-product"],
      });
      queryClient.invalidateQueries({
        queryKey: ["product-suppliers-by-supplier"],
      });
      success(t("toast.updated"));
    },
    onError: (err) => {
      error(
        t("toast.error.generic"),
        getErrorMessage(err) || t("common.unexpectedError")
      );
    },
  });
}
