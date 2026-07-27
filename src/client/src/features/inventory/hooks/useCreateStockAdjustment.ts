import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStockAdjustment } from "../api/stock-adjustments";
import type { CreateStockAdjustmentRequest } from "../types/stock-adjustment.types";

export function useCreateStockAdjustment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStockAdjustmentRequest) => createStockAdjustment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-adjustments"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-levels"] });
    },
  });
}
