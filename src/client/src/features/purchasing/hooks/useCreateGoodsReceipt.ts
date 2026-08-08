import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGoodsReceipt } from "../api/goods-receipts";
import type { CreateGoodsReceiptRequest } from "../types/goods-receipt.types";

export function useCreateGoodsReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGoodsReceiptRequest) => createGoodsReceipt(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goods-receipts"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-levels"] });
    },
    onError: () => {
      // Backend BusinessException (e.g. over-receiving) is exposed through mutation.error.
    },
  });
}