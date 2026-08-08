import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupplier } from "../api/suppliers";
import type { CreateSupplierRequest } from "../types/supplier.types";

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSupplierRequest) => createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers-dropdown"] });
    },
  });
}