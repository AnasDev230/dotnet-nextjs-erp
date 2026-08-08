import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProductSupplier } from "../api/product-suppliers";
import type { UpdateProductSupplierRequest } from "../types/product-supplier.types";

export function useUpdateProductSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProductSupplierRequest;
    }) => updateProductSupplier(id, data),
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