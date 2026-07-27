import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateWarehouse } from "../api/warehouses";
import type { UpdateWarehouseRequest } from "../types/warehouse.types";

export function useUpdateWarehouse(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateWarehouseRequest) => updateWarehouse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      queryClient.invalidateQueries({ queryKey: ["warehouses-dropdown"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse", id] });
    },
  });
}
