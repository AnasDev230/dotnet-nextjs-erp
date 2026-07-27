import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProduct } from "../api/products";
import type { UpdateProductRequest } from "../types/product.types";

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProductRequest) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
    },
  });
}
