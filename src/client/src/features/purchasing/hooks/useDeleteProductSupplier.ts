import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProductSupplier } from "../api/product-suppliers";

export function useDeleteProductSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProductSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["product-suppliers-by-product"],
      });
      queryClient.invalidateQueries({
        queryKey: ["product-suppliers-by-supplier"],
      });
    },
  });
}