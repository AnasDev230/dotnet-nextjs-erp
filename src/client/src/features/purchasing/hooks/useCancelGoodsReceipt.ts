import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelGoodsReceipt } from "../api/goods-receipts";

export function useCancelGoodsReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelGoodsReceipt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goods-receipts"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-levels"] });
    },
  });
}