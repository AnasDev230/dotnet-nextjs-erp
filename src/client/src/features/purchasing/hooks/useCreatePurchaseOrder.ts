import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPurchaseOrder } from "../api/purchase-orders";
import type { CreatePurchaseOrderRequest } from "../types/purchase-order.types";

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePurchaseOrderRequest) =>
      createPurchaseOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
    onError: () => {
      // Backend BusinessException is exposed through mutation.error.
    },
  });
}