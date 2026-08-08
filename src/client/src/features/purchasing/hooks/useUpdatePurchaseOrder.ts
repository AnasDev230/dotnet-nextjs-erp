import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePurchaseOrder } from "../api/purchase-orders";
import type { UpdatePurchaseOrderRequest } from "../types/purchase-order.types";

export function useUpdatePurchaseOrder(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePurchaseOrderRequest) =>
      updatePurchaseOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-order", id] });
    },
    onError: () => {
      // Backend BusinessException is exposed through mutation.error.
    },
  });
}