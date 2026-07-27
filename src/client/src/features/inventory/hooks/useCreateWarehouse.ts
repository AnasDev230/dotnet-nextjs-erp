import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWarehouse } from "../api/warehouses";
import type { CreateWarehouseRequest } from "../types/warehouse.types";

export function useCreateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWarehouseRequest) => createWarehouse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      queryClient.invalidateQueries({ queryKey: ["warehouses-dropdown"] });
    },
  });
}
