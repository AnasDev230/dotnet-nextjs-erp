import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitPurchaseOrder } from "../api/purchase-orders";

export function useSubmitPurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => submitPurchaseOrder(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-order", id] });
    },
  });
}
