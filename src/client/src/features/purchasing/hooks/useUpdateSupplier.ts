import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSupplier } from "../api/suppliers";
import type { UpdateSupplierRequest } from "../types/supplier.types";

export function useUpdateSupplier(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateSupplierRequest) => updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["supplier", id] });
      queryClient.invalidateQueries({ queryKey: ["suppliers-dropdown"] });
    },
  });
}