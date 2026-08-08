import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePurchaseOrder } from "../api/purchase-orders";

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
}