import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProductSupplier } from "../api/product-suppliers";
import type { CreateProductSupplierRequest } from "../types/product-supplier.types";

export function useCreateProductSupplier() {
  const queryClient = useQueryClient();
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
    },
  });
}