import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct } from "../api/products";
import type { CreateProductRequest } from "../types/product.types";

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductRequest) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
