import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelPurchaseOrder } from "../api/purchase-orders";

export function useCancelPurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelPurchaseOrder(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-order", id] });
    },
  });
}
