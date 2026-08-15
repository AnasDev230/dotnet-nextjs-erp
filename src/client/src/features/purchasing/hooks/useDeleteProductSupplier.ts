import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/error-handler";
import { deleteProductSupplier } from "../api/product-suppliers";

export function useDeleteProductSupplier() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteProductSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-suppliers"] });
      queryClient.invalidateQueries({
        queryKey: ["product-suppliers-by-product"],
      });
      queryClient.invalidateQueries({
        queryKey: ["product-suppliers-by-supplier"],
      });
      success(t("toast.deleted"));
    },
    onError: (err) => {
      error(
        t("toast.error.generic"),
        getErrorMessage(err) || t("common.unexpectedError")
      );
    },
  });
}
