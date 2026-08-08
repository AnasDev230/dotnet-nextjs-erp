import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approvePurchaseOrder } from "../api/purchase-orders";

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approvePurchaseOrder(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-order", id] });
    },
  });
}
